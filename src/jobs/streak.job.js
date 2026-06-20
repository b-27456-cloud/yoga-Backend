/**
 * Nightly Cron Job for Streaks
 * Runs at midnight every day to evaluate streaks.
 */

const cron = require('node-cron');
const streakService = require('../modules/streaks/streak.service');
const logger = require('../middleware/logging');

function initStreakCronJobs() {
  // Run at 00:00 every day
  // '0 0 * * *' = midnight
  cron.schedule('0 0 * * *', async () => {
    try {
      logger.info('Running nightly streak cron job');
      await streakService.processNightlyResets();
    } catch (err) {
      logger.error('Failed to run nightly streak cron job', { error: err.message });
      // In production, send alert to Sentry
    }
  });

  logger.info('Streak cron jobs initialized');
}

module.exports = {
  initStreakCronJobs,
};
