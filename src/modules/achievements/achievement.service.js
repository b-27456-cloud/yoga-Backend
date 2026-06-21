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
    const earned = await UserAchievement.find({ user_id }).select('achievement_id points_earned').lean();
    const earnedSet = new Set(earned.map(e => e.achievement_id.toString()));
    
    let totalPoints = earned.reduce((sum, e) => sum + (e.points_earned || 0), 0);
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
          conditionMet = streak.total_days_practiced >= conditionValue;
          break;
        case 'total_minutes':
          conditionMet = streak.total_minutes_practiced >= conditionValue;
          break;
        case 'average_accuracy':
          break;
      }

      if (conditionMet) {
        // Award the badge
        newlyEarned.push({
          user_id,
          achievement_id: badge._id,
          points_earned: badge.points_reward,
        });
        totalPoints += badge.points_reward;
        logger.info(`User ${user_id} earned badge: ${badge.slug}`);
        
        // Phase 9: Trigger FCM Notification
        const { sendNotification } = require('../../services/fcm.service');
        sendNotification(user_id, 'New Badge Earned! 🏆', `You just unlocked: ${badge.name}`, 'badge', { badge_slug: badge.slug }).catch(() => {});
      }
    }

    if (newlyEarned.length > 0) {
      // Bulk insert new achievements
      await UserAchievement.insertMany(newlyEarned);
    }
    
    // 5. Update user level based on total points (100 points = 1 level)
    const newLevel = Math.floor(totalPoints / 100) + 1;
    const User = require('../auth/auth.model');
    const user = await User.findById(user_id);
    
    if (user && user.stats.current_level < newLevel) {
      logger.info(`User ${user_id} leveled up to ${newLevel}!`);
      user.stats.current_level = newLevel;
      await user.save();
      
      const { sendNotification } = require('../../services/fcm.service');
      sendNotification(user_id, 'Level Up! ⭐', `Congratulations! You reached Level ${newLevel}.`, 'system', { new_level: newLevel }).catch(() => {});
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
