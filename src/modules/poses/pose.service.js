/**
 * Pose Service
 * Business logic for yoga poses including caching and CRUD operations.
 */

const Pose = require('./pose.model');
const { cache, getOrSet, invalidateByPrefix } = require('../../config/cache');
const { AppError } = require('../../middleware/errorHandler');
const Session = require('../sessions/session.model');
const logger = require('../../middleware/logging');

const CACHE_PREFIX = 'poses_';
const LIST_TTL = 3600; // 1 hour
const DETAIL_TTL = 7200; // 2 hours

/**
 * Get paginated list of poses with optional filtering and search.
 */
async function getPoses({ page = 1, limit = 10, difficulty, level, target_area, search }) {
  const query = {
    published: true,
    // Only return poses that have both a cover image and a video attached
    image_url: { $exists: true, $ne: null, $ne: '' },
    'video.full_url': { $exists: true, $ne: null, $ne: '' },
  };

  if (difficulty) query.difficulty = difficulty;
  if (level) query.level = Number(level);
  if (target_area) query.target_areas = target_area;
  if (search) query.$text = { $search: search };

  // Cache key based on query parameters
  const cacheKey = `${CACHE_PREFIX}list_${JSON.stringify({ page, limit, difficulty, level, target_area, search })}`;

  return getOrSet(cacheKey, async () => {
    const skip = (page - 1) * limit;

    let mongoQuery = Pose.find(query);

    // If searching by text, sort by text score
    if (search) {
      mongoQuery = mongoQuery.sort({ score: { $meta: 'textScore' } });
    } else {
      mongoQuery = mongoQuery.sort({ level: 1, name: 1 }); // Default sort
    }

    const [poses, total] = await Promise.all([
      mongoQuery.skip(skip).limit(Number(limit)).lean(),
      Pose.countDocuments(query),
    ]);

    return {
      poses,
      meta: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / limit),
      },
    };
  }, LIST_TTL);
}

/**
 * Get a single pose by ID or slug.
 */
async function getPoseByIdOrSlug(idOrSlug) {
  const cacheKey = `${CACHE_PREFIX}detail_${idOrSlug}`;

  return getOrSet(cacheKey, async () => {
    let query = { published: true };

    // Check if valid ObjectId, else treat as slug
    if (idOrSlug.match(/^[0-9a-fA-F]{24}$/)) {
      query._id = idOrSlug;
    } else {
      query.slug = idOrSlug;
    }

    const pose = await Pose.findOne(query).lean();

    if (!pose) {
      throw new AppError('Pose not found', 404);
    }

    return pose;
  }, DETAIL_TTL);
}

/**
 * Admin: Create a new pose.
 */
async function createPose(poseData) {
  // Generate slug if not provided
  if (!poseData.slug && poseData.name) {
    poseData.slug = poseData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  }

  const pose = await Pose.create(poseData);
  
  // Invalidate list caches
  invalidateByPrefix(`${CACHE_PREFIX}list_`);
  logger.info('New pose created', { pose_id: pose._id });
  
  return pose;
}

/**
 * Admin: Update an existing pose.
 */
async function updatePose(poseId, updates) {
  if (updates.name && !updates.slug) {
    updates.slug = updates.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  }

  const pose = await Pose.findByIdAndUpdate(poseId, updates, { new: true, runValidators: true });

  if (!pose) {
    throw new AppError('Pose not found', 404);
  }

  // Invalidate specific detail cache and all list caches
  invalidateByPrefix(`${CACHE_PREFIX}detail_${poseId}`);
  invalidateByPrefix(`${CACHE_PREFIX}detail_${pose.slug}`);
  invalidateByPrefix(`${CACHE_PREFIX}list_`);
  
  logger.info('Pose updated', { pose_id: poseId });
  return pose;
}

/**
 * Admin: Delete a pose.
 */
async function deletePose(poseId) {
  const pose = await Pose.findByIdAndDelete(poseId);

  if (!pose) {
    throw new AppError('Pose not found', 404);
  }

  // Invalidate specific detail cache and all list caches
  invalidateByPrefix(`${CACHE_PREFIX}detail_${poseId}`);
  invalidateByPrefix(`${CACHE_PREFIX}detail_${pose.slug}`);
  invalidateByPrefix(`${CACHE_PREFIX}list_`);

  logger.info('Pose deleted', { pose_id: poseId });
}

/**
 * Check if a user has access to a pose based on difficulty progression.
 * Beginner poses are always accessible.
 * Intermediate and advanced poses require ALL beginner poses to be completed at least once.
 *
 * @param {string|ObjectId} user_id - The authenticated user's MongoDB ID
 * @param {object} pose            - The pose document (must have .difficulty and .name)
 * @throws {AppError} 403 with a list of remaining beginner poses if access is denied
 */
async function checkProgressionAccess(user_id, pose) {
  // Beginner poses are always accessible
  if (pose.difficulty === 'beginner') return;

  // Fetch all published beginner poses (id + name only)
  const beginnerPoses = await Pose.find(
    { difficulty: 'beginner', published: true },
    { _id: 1, name: 1 }
  ).lean();

  if (beginnerPoses.length === 0) return; // no beginner poses defined → allow access

  // Fetch the distinct pose_ids the user has completed
  const completedPoseIds = await Session.distinct('pose_id', {
    user_id,
    completed: true,
  });

  // Convert to a Set of strings for O(1) lookups
  const completedSet = new Set(completedPoseIds.map((id) => id.toString()));

  // Find which beginner poses are NOT yet completed
  const remaining = beginnerPoses.filter(
    (p) => !completedSet.has(p._id.toString())
  );

  if (remaining.length > 0) {
    const remainingNames = remaining.map((p) => p.name).join(', ');
    throw new AppError(
      `You must complete all beginner poses before accessing intermediate poses. ` +
      `Remaining beginner poses: ${remainingNames}.`,
      403
    );
  }
}

module.exports = {
  getPoses,
  getPoseByIdOrSlug,
  createPose,
  updatePose,
  deletePose,
  checkProgressionAccess,
};
