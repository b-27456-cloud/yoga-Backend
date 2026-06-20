/**
 * Achievement Service
 * Handles badge evaluation and tracking for gamification.
 */

const Achievement = require('./achievement.model');
const UserAchievement = require('./userAchievement.model');
const { getOrCreateStreak } = require('../streaks/streak.service');
const { cache, getOrSet, invalidateByPrefix } = require('../../config/cache');
const logger = require('../../middleware/logging');

const CACHE_PREFIX = 'achievements_';

/**
 * Get the full catalog of possible achievements.
 * Cached because the catalog rarely changes.
 */
async function getCatalog() {
  return getOrSet(`${CACHE_PREFIX}catalog`, async () => {
    return Achievement.find({}).sort({ category: 1, points_reward: 1 }).lean();
  }, 86400); // 24 hours
}

/**
 * Get all achievements earned by a specific user.
 */
async function getUserAchievements(user_id) {
  return UserAchievement.find({ user_id })
    .populate('achievement_id')
    .sort({ earned_at: -1 })
    .lean();
}

/**
 * Admin: Create a new achievement type
 */
async function createAchievement(data) {
  const achievement = await Achievement.create(data);
  invalidateByPrefix(`${CACHE_PREFIX}catalog`);
  logger.info('New achievement created', { slug: achievement.slug });
  return achievement;
}

/**
 * Evaluate if a user has earned any new badges based on their latest session.
 * Called async by the Session service.
 */
async function evaluateBadges(user_id) {
  try {
    // 1. Fetch user's current streak stats
    const streak = await getOrCreateStreak(user_id);
    
    // 2. Fetch all achievements catalog
    const catalog = await getCatalog();

    // 3. Fetch user's currently earned achievements
    const earned = await UserAchievement.find({ user_id }).select('achievement_id').lean();
    const earnedSet = new Set(earned.map(e => e.achievement_id.toString()));

    const newlyEarned = [];

    // 4. Evaluate each unearned achievement against current stats
    for (const badge of catalog) {
      if (earnedSet.has(badge._id.toString())) continue;

      let conditionMet = false;
      const conditionValue = badge.condition.value;

      switch (badge.condition.type) {
        case 'streak_days':
          conditionMet = streak.current_streak >= conditionValue;
          break;
        case 'total_sessions':
          // total_days_practiced is a close proxy, or we can use a true session count if needed.
          // For now, assume total_days_practiced = total_sessions for MVP, or we can query Session count.
          // Let's use total_days_practiced for simplicity in this MVP version.
          conditionMet = streak.total_days_practiced >= conditionValue;
          break;
        case 'total_minutes':
          conditionMet = streak.total_minutes_practiced >= conditionValue;
          break;
        case 'average_accuracy':
          // This requires querying all sessions or getting an aggregated value.
          // Since it's a bit heavy, we might skip or use a rolling average stored somewhere.
          // Let's assume we won't evaluate accuracy badges here unless strictly needed.
          break;
      }

      if (conditionMet) {
        // Award the badge
        newlyEarned.push({
          user_id,
          achievement_id: badge._id,
          points_earned: badge.points_reward,
        });
        logger.info(`User ${user_id} earned badge: ${badge.slug}`);
        
        // Phase 9: Trigger FCM Notification
        const { sendNotification } = require('../../services/fcm.service');
        sendNotification(user_id, 'New Badge Earned! 🏆', `You just unlocked: ${badge.name}`, 'badge', { badge_slug: badge.slug }).catch(() => {});
      }
    }

    if (newlyEarned.length > 0) {
      // Bulk insert new achievements
      await UserAchievement.insertMany(newlyEarned);
      // In production, we would trigger a notification here via WebSocket or Push
    }

  } catch (error) {
    logger.error('Failed to evaluate badges', { user_id, error: error.message });
  }
}

module.exports = {
  getCatalog,
  getUserAchievements,
  createAchievement,
  evaluateBadges,
};
