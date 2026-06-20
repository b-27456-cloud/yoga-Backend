/**
 * Leaderboard Service
 * Calculates and retrieves global leaderboard based on streaks.
 */

const { getOrSet, cache } = require('../../config/cache');
const Streak = require('../streaks/streak.model');

const CACHE_KEY = 'global_leaderboard';

/**
 * Calculates the top 100 users based on their current streak and total minutes practiced.
 * This is run by the hourly cron job.
 */
async function computeLeaderboard() {
  const topStreaks = await Streak.aggregate([
    {
      $lookup: {
        from: 'users',
        localField: 'user_id',
        foreignField: '_id',
        as: 'user',
      },
    },
    { $unwind: '$user' },
    { $match: { 'user.privacy.show_on_leaderboard': true, 'user.deleted': { $ne: true } } },
    {
      $project: {
        user_id: 1,
        first_name: '$user.first_name',
        profile_photo_url: '$user.profile_photo_url',
        current_streak: 1,
        longest_streak: 1,
        total_minutes_practiced: 1,
      },
    },
    {
      // Primary sort by current streak, secondary sort by total minutes
      $sort: { current_streak: -1, total_minutes_practiced: -1 },
    },
    { $limit: 100 },
  ]);

  // Add rank
  const ranked = topStreaks.map((entry, index) => ({
    rank: index + 1,
    ...entry,
  }));

  // Store in cache for 1 hour (3600 seconds)
  cache.set(CACHE_KEY, ranked, 3600);
  return ranked;
}

/**
 * Get the current global leaderboard
 */
async function getGlobalLeaderboard() {
  // Try cache first, if empty, compute it
  return getOrSet(CACHE_KEY, async () => {
    return computeLeaderboard();
  }, 3600);
}

module.exports = {
  computeLeaderboard,
  getGlobalLeaderboard,
};
