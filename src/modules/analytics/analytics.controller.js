/**
 * Analytics Controller
 */

const analyticsService = require('./analytics.service');

/**
 * Require ownership middleware inside the controller
 */
function checkOwnership(req, res, next) {
  if (req.user.user_id.toString() !== req.params.user_id && req.user.role !== 'admin') {
    return res.status(403).json({
      status: 'error',
      message: 'Forbidden: You can only view your own analytics',
    });
  }
  next();
}

/**
 * Get daily stats
 * GET /api/v1/analytics/user/:user_id/daily?date=YYYY-MM-DD
 */
async function getDailyStats(req, res, next) {
  try {
    const { date } = req.query;
    if (!date) {
      return res.status(400).json({ status: 'error', message: 'date query parameter is required (YYYY-MM-DD)' });
    }
    const result = await analyticsService.getDailyStats(req.params.user_id, date);
    res.status(200).json({ status: 'success', data: result });
  } catch (err) {
    next(err);
  }
}

/**
 * Get weekly stats
 * GET /api/v1/analytics/user/:user_id/weekly?week_start=YYYY-MM-DD
 */
async function getWeeklyStats(req, res, next) {
  try {
    const { week_start } = req.query;
    if (!week_start) {
      return res.status(400).json({ status: 'error', message: 'week_start query parameter is required (YYYY-MM-DD)' });
    }
    const result = await analyticsService.getWeeklyStats(req.params.user_id, week_start);
    res.status(200).json({ status: 'success', data: result });
  } catch (err) {
    next(err);
  }
}

/**
 * Get dashboard stats
 * GET /api/v1/analytics/user/:user_id/stats
 */
async function getDashboardStats(req, res, next) {
  try {
    const result = await analyticsService.getDashboardStats(req.params.user_id);
    res.status(200).json({ status: 'success', data: result });
  } catch (err) {
    next(err);
  }
}

/**
 * Get insights
 * GET /api/v1/analytics/user/:user_id/insights
 */
async function getInsights(req, res, next) {
  try {
    const result = await analyticsService.getInsights(req.params.user_id);
    res.status(200).json({ status: 'success', data: result });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  checkOwnership,
  getDailyStats,
  getWeeklyStats,
  getDashboardStats,
  getInsights,
};
