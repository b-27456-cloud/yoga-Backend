/**
 * Hourly Cron Job for Analytics
 * Pre-heats the cache for active users so their dashboard loads instantly.
 */

const cron = require('node-cron');
const analyticsService = require('../modules/analytics/analytics.service');
const logger = require('../middleware/logging');

function initAnalyticsCronJobs() {
  // Run at minute 0 past every hour
  // '0 * * * *' = hourly
  cron.schedule('0 * * * *', async () => {
    try {
      logger.info('Running hourly analytics cache preheat');
      await analyticsService.preheatAnalyticsCache();
    } catch (err) {
      logger.error('Failed to run hourly analytics cron', { error: err.message });
    }
  });

  logger.info('Analytics cron jobs initialized');
}

module.exports = {
  initAnalyticsCronJobs,
};
