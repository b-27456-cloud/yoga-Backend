/**
 * Session Service
 * Business logic for starting, logging frames to, and ending yoga sessions.
 */

const Session = require('./session.model');
const Pose = require('../poses/pose.model');
const { getSignedUrl } = require('../../config/storage');
const { evaluatePoseAccuracy } = require('./angle.calculator');
const { AppError } = require('../../middleware/errorHandler');
const logger = require('../../middleware/logging');

// We will load Sentry dynamically if it's configured in later phases
let Sentry;
try {
  Sentry = require('@sentry/node');
} catch (e) {
  // Sentry not installed yet
}

/**
 * Start a new yoga session.
 */
async function startSession({ user_id, pose_id, music_id }) {
  // Frontend might send 'none' or empty string if no music is selected
  if (music_id === 'none' || music_id === '') {
    music_id = null;
  }

  // Verify pose exists by ID or Slug
  let query = { published: true };
  if (pose_id.match(/^[0-9a-fA-F]{24}$/)) {
    query._id = pose_id;
  } else {
    query.slug = pose_id;
  }
  
  const pose = await Pose.findOne(query).lean();
  if (!pose) {
    throw new AppError('Pose not found', 404);
  }

  // Enforce progression gate: intermediate/advanced poses require all beginner poses completed.
  // Loaded dynamically to avoid circular dependency between session.service ↔ pose.service.
  const { checkProgressionAccess } = require('../poses/pose.service');
  await checkProgressionAccess(user_id, pose);

  // Create the session (ensure we store the actual ObjectId, not the slug)
  const session = await Session.create({
    user_id,
    pose_id: pose._id,
    music_id,
    start_time: new Date(),
  });

  // Generate signed URL for the pose video if it exists
  let videoUrl = null;
  if (pose.video && pose.video.full_url) {
    // In a real scenario, this would be a Cloudinary public ID stored in DB.
    // Assuming full_url stores the public ID for this project.
    try {
      videoUrl = getSignedUrl(pose.video.full_url, { resource_type: 'video' }, 7200);
    } catch (err) {
      logger.warn(`Could not generate signed URL for video: ${err.message}`);
    }
  }

  logger.info('Session started', { session_id: session._id, user_id });

  return {
    session,
    videoUrl,
    reference_angles: pose.reference_angles,
  };
}

/**
 * Log a frame from the client (MediaPipe landmarks).
 * Calculates accuracy against the pose reference angles.
 */
async function logFrame({ session_id, user_id, landmarks }) {
  // Use findOne to ensure the user owns this session
  const session = await Session.findOne({ _id: session_id, user_id });
  if (!session) {
    throw new AppError('Session not found', 404);
  }

  if (session.completed) {
    throw new AppError('Cannot log frame to a completed session', 400);
  }

  // Fetch the pose to get reference angles
  const pose = await Pose.findById(session.pose_id).lean();
  if (!pose || !pose.reference_angles) {
    throw new AppError('Pose reference data unavailable', 400);
  }

  // Calculate accuracy
  const { overall_accuracy, calculated_angles, feedback } = evaluatePoseAccuracy(
    landmarks,
    pose.reference_angles
  );

  // Push frame data to session
  const frameData = {
    timestamp: new Date(),
    landmarks,
    angles: calculated_angles,
    accuracy: overall_accuracy,
  };

  // We only keep the last 30 frames in the document to prevent unbounded array growth
  // In a production app, we would write this to a time-series DB (like InfluxDB)
  // or a separate MongoDB collection. For FYP, unbounded array is fine if short,
  // but let's cap it to 300 frames (~10 seconds at 30fps) for safety.
  await Session.updateOne(
    { _id: session_id },
    {
      $push: {
        landmarks_data: {
          $each: [frameData],
          $slice: -300, // keep last 300
        },
        accuracy_timeline: {
          $each: [overall_accuracy],
          $slice: -300,
        },
      },
    }
  );

  return {
    accuracy: overall_accuracy,
    feedback,
  };
}

/**
 * End a yoga session and trigger background tasks.
 */
async function endSession({ session_id, user_id, notes }) {
  const session = await Session.findOne({ _id: session_id, user_id });
  if (!session) {
    throw new AppError('Session not found', 404);
  }

  if (session.completed) {
    logger.info('Session already completed, returning existing session to make endpoint idempotent', { session_id });
    return session;
  }

  const endTime = new Date();
  const durationSeconds = Math.round((endTime - session.start_time) / 1000);

  // Calculate overall average accuracy from timeline
  let averageAccuracy = 0;
  if (session.accuracy_timeline && session.accuracy_timeline.length > 0) {
    const sum = session.accuracy_timeline.reduce((a, b) => a + b, 0);
    averageAccuracy = Math.round(sum / session.accuracy_timeline.length);
  }

  session.end_time = endTime;
  session.duration_seconds = durationSeconds;
  session.accuracy_average = averageAccuracy;
  session.completed = true;
  if (notes) session.notes = notes;

  await session.save();

  logger.info('Session completed', { session_id, durationSeconds, averageAccuracy });

  // Trigger background tasks (non-blocking)
  setImmediate(() => {
    processPostSessionTasks(session).catch((err) => {
      logger.error('Background task failed after session end', { session_id, error: err.message });
      if (Sentry) Sentry.captureException(err);
    });
  });

  return session;
}

/**
 * Get session history for a user
 */
async function getUserHistory(user_id, page = 1, limit = 10) {
  const skip = (page - 1) * limit;

  const [sessions, total] = await Promise.all([
    Session.find({ user_id, completed: true })
      .sort({ start_time: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate('pose_id', 'name slug level')
      .select('-landmarks_data') // Omit heavy landmark data for list
      .lean(),
    Session.countDocuments({ user_id, completed: true }),
  ]);

  return {
    sessions,
    meta: {
      total,
      page: Number(page),
      limit: Number(limit),
      pages: Math.ceil(total / limit),
    },
  };
}

/**
 * Get a single session details
 */
async function getSessionById(session_id, user_id) {
  const session = await Session.findOne({ _id: session_id, user_id })
    .populate('pose_id', 'name slug description level video')
    .lean();

  if (!session) {
    throw new AppError('Session not found', 404);
  }

  return session;
}

/**
 * Private async worker for post-session logic
 */
async function processPostSessionTasks(session) {
  // Phase 5: Streak updating
  const { updateUserStreak } = require('../streaks/streak.service');
  await updateUserStreak(session);

  // Phase 7: Analytics aggregation
  // require('../analytics/analytics.service').aggregateSession(session);

  // Phase 8: Badge evaluation
  const { evaluateBadges } = require('../achievements/achievement.service');
  await evaluateBadges(session.user_id);

  logger.debug('Post-session background tasks completed', { session_id: session._id });
}

module.exports = {
  startSession,
  logFrame,
  endSession,
  getUserHistory,
  getSessionById,
};
