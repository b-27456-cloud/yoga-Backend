/**
 * Achievement Controller
 */

const achievementService = require('./achievement.service');

/**
 * Get the full catalog of achievements
 * GET /api/v1/achievements
 */
async function getCatalog(req, res, next) {
  try {
    const catalog = await achievementService.getCatalog();
    
    res.status(200).json({
      status: 'success',
      data: catalog,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Get achievements earned by a user
 * GET /api/v1/achievements/user/:user_id
 */
async function getUserAchievements(req, res, next) {
  try {
    // Only allow users to view their own achievements (unless admin)
    if (req.user.user_id.toString() !== req.params.user_id && req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Forbidden: You can only view your own achievements',
      });
    }

    const achievements = await achievementService.getUserAchievements(req.params.user_id);
    
    res.status(200).json({
      status: 'success',
      data: achievements,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Admin: Create a new achievement
 * POST /api/v1/achievements
 */
async function createAchievement(req, res, next) {
  try {
    const achievement = await achievementService.createAchievement(req.body);
    
    res.status(201).json({
      status: 'success',
      data: achievement,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getCatalog,
  getUserAchievements,
  createAchievement,
};
