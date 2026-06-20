/**
 * Leaderboard Cron Job
 * Refreshes the global leaderboard cache periodically.
 */

const cron = require('node-cron');
const leaderboardService = require('../modules/leaderboard/leaderboard.service');
const logger = require('../middleware/logging');

function initLeaderboardCronJobs() {
  // Run at minute 15 past every hour to spread load
  cron.schedule('15 * * * *', async () => {
    try {
      logger.info('Running leaderboard aggregation job');
      await leaderboardService.computeLeaderboard();
    } catch (err) {
      logger.error('Failed to run leaderboard cron', { error: err.message });
    }
  });

  logger.info('Leaderboard cron jobs initialized');
}

module.exports = {
  initLeaderboardCronJobs,
};
