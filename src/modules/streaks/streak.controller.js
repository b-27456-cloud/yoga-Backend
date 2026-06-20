/**
 * Streak Controller
 * Handles HTTP requests for streak summaries and freezes.
 */

const streakService = require('./streak.service');

/**
 * Get streak summary for a user
 * GET /api/v1/streaks/user/:user_id
 */
async function getStreakSummary(req, res, next) {
  try {
    // Enforce ownership
    if (req.user.user_id.toString() !== req.params.user_id && req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Forbidden: You can only view your own streaks',
      });
    }

    const summary = await streakService.getStreakSummary(req.params.user_id);
    
    res.status(200).json({
      status: 'success',
      data: summary,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Freeze streak for today
 * POST /api/v1/streaks/freeze
 */
async function freezeStreak(req, res, next) {
  try {
    const streak = await streakService.freezeStreak(req.user.user_id);
    
    res.status(200).json({
      status: 'success',
      message: 'Streak successfully frozen for today',
      data: streak,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getStreakSummary,
  freezeStreak,
};
