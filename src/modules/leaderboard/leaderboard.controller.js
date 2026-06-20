/**
 * Leaderboard Controller
 */

const leaderboardService = require('./leaderboard.service');

/**
 * Get global leaderboard
 * GET /api/v1/leaderboard/global
 */
async function getGlobalLeaderboard(req, res, next) {
  try {
    const leaderboard = await leaderboardService.getGlobalLeaderboard();
    
    res.status(200).json({
      status: 'success',
      data: leaderboard,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getGlobalLeaderboard,
};
