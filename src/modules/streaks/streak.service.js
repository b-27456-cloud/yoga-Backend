/**
 * Streak Service
 * Handles streak tracking, daily progress updates, and streak freezes.
 */

const Streak = require('./streak.model');
const DailyProgress = require('./dailyProgress.model');
const { AppError } = require('../../middleware/errorHandler');
const logger = require('../../middleware/logging');

/**
 * Helper to get the local YYYY-MM-DD date string for a user.
 * For MVP, we assume server time (UTC) or a fixed timezone.
 * In production, we'd accept the user's timezone from their app.
 */
function getLocalDateString(date = new Date()) {
  return date.toISOString().split('T')[0];
}

/**
 * Initialize a blank streak record for a new user.
 * Typically called when user registers.
 */
async function initializeStreak(user_id) {
  return Streak.create({ user_id });
}

/**
 * Get or create the streak record for a user.
 */
async function getOrCreateStreak(user_id) {
  let streak = await Streak.findOne({ user_id });
  if (!streak) {
    streak = await initializeStreak(user_id);
  }
  return streak;
}

/**
 * Process a completed session to update the user's streak and daily progress.
 * Called async via setImmediate from the Session Service.
 *
 * @param {Object} session - Completed session document
 */
async function updateUserStreak(session) {
  const { user_id, duration_seconds, accuracy_average, end_time } = session;
  const dateString = getLocalDateString(end_time);

  // 1. Update Daily Progress
  let progress = await DailyProgress.findOne({ user_id, date_string: dateString });
  
  if (!progress) {
    // First session of the day
    progress = await DailyProgress.create({
      user_id,
      date_string: dateString,
      sessions_completed: 1,
      total_minutes: Math.round(duration_seconds / 60),
      average_accuracy: accuracy_average,
    });
  } else {
    // Subsequent session today
    const newTotalMinutes = progress.total_minutes + Math.round(duration_seconds / 60);
    const newAverage = Math.round(
      ((progress.average_accuracy * progress.sessions_completed) + accuracy_average) / 
      (progress.sessions_completed + 1)
    );

    progress.sessions_completed += 1;
    progress.total_minutes = newTotalMinutes;
    progress.average_accuracy = newAverage;
    await progress.save();
  }

  // 2. Update Streak
  const streak = await getOrCreateStreak(user_id);
  
  const lastSessionDateString = streak.last_session_date 
    ? getLocalDateString(streak.last_session_date) 
    : null;

  streak.total_minutes_practiced += Math.round(duration_seconds / 60);
  streak.last_session_date = end_time;

  // Streak calculation logic
  if (!lastSessionDateString) {
    // First ever session
    streak.current_streak = 1;
    streak.streak_start_date = end_time;
    streak.total_days_practiced = 1;
  } else if (lastSessionDateString === dateString) {
    // Already practiced today, streak doesn't increment
    // (do nothing to current_streak)
  } else {
    // Check if it's the next consecutive day
    const lastDate = new Date(lastSessionDateString);
    const today = new Date(dateString);
    const diffTime = Math.abs(today - lastDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      // Practiced yesterday! Increment streak.
      streak.current_streak += 1;
      streak.total_days_practiced += 1;
      
      // Phase 9: FCM Notification for Streak Milestones
      if ([7, 14, 30, 50, 100, 365].includes(streak.current_streak)) {
        const { sendNotification } = require('../../services/fcm.service');
        sendNotification(user_id, 'Amazing Consistency! 🔥', `You hit a ${streak.current_streak}-day streak! Keep it up!`, 'streak').catch(() => {});
      }
    } else {
      // Missed a day. Was the streak saved by a freeze?
      // (The cron job normally handles breaking the streak, but just in case 
      // the user practices after missing days before the cron runs, we reset it here).
      
      // If we got here, they missed > 1 day and the cron didn't catch it 
      // OR they were frozen. Let's assume if current_streak > 0, they were frozen or missed.
      // To be safe, we reset.
      streak.current_streak = 1;
      streak.streak_start_date = end_time;
      streak.total_days_practiced += 1;
    }
  }

  // Update longest streak
  if (streak.current_streak > streak.longest_streak) {
    streak.longest_streak = streak.current_streak;
  }

  await streak.save();
  logger.info('Streak updated', { user_id, current_streak: streak.current_streak });

  return { streak, progress };
}

/**
 * Manually apply a streak freeze to save the current streak.
 * The user must have a freeze available.
 */
async function freezeStreak(user_id) {
  const streak = await getOrCreateStreak(user_id);

  if (streak.available_freezes <= 0) {
    throw new AppError('No streak freezes available', 400);
  }

  if (streak.current_streak === 0) {
    throw new AppError('Cannot freeze a streak of 0', 400);
  }

  const todayStr = getLocalDateString(new Date());
  
  // Check if today is already frozen or practiced
  const todayProgress = await DailyProgress.findOne({ user_id, date_string: todayStr });
  
  if (todayProgress && todayProgress.sessions_completed > 0) {
    throw new AppError('Already practiced today, freeze not needed', 400);
  }

  if (todayProgress && todayProgress.is_frozen) {
    throw new AppError('Streak already frozen for today', 400);
  }

  // Consume a freeze and mark today as frozen
  streak.available_freezes -= 1;
  // We don't increment last_session_date because they didn't actually practice
  await streak.save();

  if (todayProgress) {
    todayProgress.is_frozen = true;
    await todayProgress.save();
  } else {
    await DailyProgress.create({
      user_id,
      date_string: todayStr,
      is_frozen: true,
    });
  }

  logger.info('Streak frozen', { user_id });
  return streak;
}

/**
 * Get current streak info for a user.
 */
async function getStreakSummary(user_id) {
  const streak = await getOrCreateStreak(user_id);
  
  // Fetch last 7 days of progress for a mini-calendar
  const today = new Date();
  const past7Days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    past7Days.push(getLocalDateString(d));
  }

  const history = await DailyProgress.find({
    user_id,
    date_string: { $in: past7Days }
  }).lean();

  const calendar = past7Days.reduce((acc, dateStr) => {
    const dayData = history.find(h => h.date_string === dateStr);
    acc[dateStr] = {
      practiced: dayData ? dayData.sessions_completed > 0 : false,
      frozen: dayData ? dayData.is_frozen : false,
    };
    return acc;
  }, {});

  return {
    ...streak.toJSON(),
    calendar_last_7_days: calendar,
  };
}

/**
 * Nightly Cron Job Logic: Reset broken streaks.
 * Iterates through all users using a memory-safe cursor.
 */
async function processNightlyResets() {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = getLocalDateString(yesterday);

  logger.info(`Starting nightly streak evaluation for ${yesterdayStr}`);

  // Find all streaks > 0
  const cursor = Streak.find({ current_streak: { $gt: 0 } }).cursor();
  let processedCount = 0;
  let resetCount = 0;

  for await (const streak of cursor) {
    processedCount++;

    const lastSessionStr = streak.last_session_date 
      ? getLocalDateString(streak.last_session_date) 
      : null;

    // Did they practice yesterday?
    if (lastSessionStr === yesterdayStr) {
      continue; // Safe
    }

    // Did they practice today? (Maybe they practice exactly at midnight)
    if (lastSessionStr === getLocalDateString(new Date())) {
      continue; // Safe
    }

    // Did they use a freeze yesterday?
    const yesterdayProgress = await DailyProgress.findOne({ 
      user_id: streak.user_id, 
      date_string: yesterdayStr 
    }).lean();

    if (yesterdayProgress && yesterdayProgress.is_frozen) {
      // They are safe due to a freeze
      // But we need to pretend they "practiced" yesterday so the logic
      // tomorrow doesn't break them. We update last_session_date silently.
      streak.last_session_date = yesterday;
      await streak.save();
      continue;
    }

    // Streak broken!
    streak.current_streak = 0;
    await streak.save();
    resetCount++;
    logger.debug(`Reset streak for user ${streak.user_id}`);
  }

  logger.info(`Nightly streak evaluation complete. Processed ${processedCount}, Reset ${resetCount}`);
}

module.exports = {
  updateUserStreak,
  freezeStreak,
  getStreakSummary,
  processNightlyResets,
  getOrCreateStreak, // exported for testing
};
