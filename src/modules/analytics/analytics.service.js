/**
 * Analytics Service
 * Provides daily/weekly aggregations and dashboard stats.
 */

const DailyProgress = require('../streaks/dailyProgress.model');
const Session = require('../sessions/session.model');
const { getOrCreateStreak } = require('../streaks/streak.service');
const { getOrSet, cache, invalidateByPrefix } = require('../../config/cache');

const CACHE_PREFIX = 'analytics_';

/**
 * Helper to get YYYY-MM-DD
 */
function getLocalDateString(date) {
  return date.toISOString().split('T')[0];
}

/**
 * Get daily stats for a specific date
 */
async function getDailyStats(user_id, dateStr) {
  const cacheKey = `${CACHE_PREFIX}daily_${user_id}_${dateStr}`;
  
  return getOrSet(cacheKey, async () => {
    const progress = await DailyProgress.findOne({ user_id, date_string: dateStr }).lean();
    
    return progress || {
      date_string: dateStr,
      sessions_completed: 0,
      total_minutes: 0,
      average_accuracy: 0,
      is_frozen: false,
    };
  }, 600); // 10 min TTL
}

/**
 * Get weekly stats starting from a specific date
 */
async function getWeeklyStats(user_id, weekStartStr) {
  const cacheKey = `${CACHE_PREFIX}weekly_${user_id}_${weekStartStr}`;
  
  return getOrSet(cacheKey, async () => {
    const startDate = new Date(weekStartStr);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    const endStr = getLocalDateString(endDate);

    const progressList = await DailyProgress.find({
      user_id,
      date_string: { $gte: weekStartStr, $lte: endStr }
    }).sort({ date_string: 1 }).lean();

    let totalMinutes = 0;
    let totalSessions = 0;
    let accSum = 0;

    progressList.forEach(p => {
      totalMinutes += p.total_minutes;
      totalSessions += p.sessions_completed;
      accSum += (p.average_accuracy * p.sessions_completed);
    });

    return {
      week_start: weekStartStr,
      week_end: endStr,
      total_sessions: totalSessions,
      total_minutes: totalMinutes,
      average_accuracy: totalSessions > 0 ? Math.round(accSum / totalSessions) : 0,
      daily_breakdown: progressList,
    };
  }, 600);
}

/**
 * Get full dashboard stats (overview)
 */
async function getDashboardStats(user_id) {
  const cacheKey = `${CACHE_PREFIX}dashboard_${user_id}`;
  
  return getOrSet(cacheKey, async () => {
    const streak = await getOrCreateStreak(user_id);
    
    // Most practiced pose aggregation
    const poseStats = await Session.aggregate([
      { $match: { user_id, completed: true } },
      { $group: { _id: '$pose_id', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 1 },
      { $lookup: { from: 'poses', localField: '_id', foreignField: '_id', as: 'pose' } },
      { $unwind: '$pose' },
      { $project: { _id: 0, pose_name: '$pose.name', count: 1 } }
    ]);

    const favoritePose = poseStats.length > 0 ? poseStats[0] : null;

    return {
      streak: streak.current_streak,
      longest_streak: streak.longest_streak,
      total_minutes: streak.total_minutes_practiced,
      total_sessions: streak.total_days_practiced, // approx
      favorite_pose: favoritePose,
    };
  }, 600);
}

/**
 * Generate personalized text insights based on recent activity
 */
async function getInsights(user_id) {
  const cacheKey = `${CACHE_PREFIX}insights_${user_id}`;
  
  return getOrSet(cacheKey, async () => {
    const streak = await getOrCreateStreak(user_id);
    const insights = [];

    if (streak.current_streak >= 7) {
      insights.push(`You're on fire! 🔥 A ${streak.current_streak}-day streak shows amazing dedication.`);
    } else if (streak.current_streak === 0 && streak.longest_streak > 0) {
      insights.push("Welcome back! Let's build a new streak today.");
    }

    if (streak.total_minutes_practiced > 600) {
      insights.push("You've practiced for over 10 hours total. Consistency is key!");
    }

    // Recent accuracy insight
    const recentSession = await Session.findOne({ user_id, completed: true }).sort({ start_time: -1 }).lean();
    if (recentSession && recentSession.accuracy_average > 90) {
      insights.push(`Great form on your last session (${recentSession.accuracy_average}% accuracy)!`);
    } else if (recentSession && recentSession.accuracy_average < 50) {
      insights.push("Focus on your form in your next session to improve accuracy.");
    }

    if (insights.length === 0) {
      insights.push("Keep practicing to unlock more insights!");
    }

    return insights;
  }, 600);
}

/**
 * Hourly Cron Job: Preheat Cache for active users
 * (Avoids cold reads on the dashboard)
 */
async function preheatAnalyticsCache() {
  // Find users who were active in the last 24 hours
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  
  const activeSessions = await Session.find({ start_time: { $gte: yesterday } }).distinct('user_id');
  
  for (const user_id of activeSessions) {
    // Invalidate existing caches
    invalidateByPrefix(`${CACHE_PREFIX}dashboard_${user_id}`);
    invalidateByPrefix(`${CACHE_PREFIX}insights_${user_id}`);
    
    // Fetch to repopulate cache
    await getDashboardStats(user_id);
    await getInsights(user_id);
  }
}

module.exports = {
  getDailyStats,
  getWeeklyStats,
  getDashboardStats,
  getInsights,
  preheatAnalyticsCache,
};
