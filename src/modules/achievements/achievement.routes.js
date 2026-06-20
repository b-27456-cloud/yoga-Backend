/**
 * Achievement Routes
 * Mount path: /api/v1/achievements
 */

const express = require('express');
const achievementController = require('./achievement.controller');
const { verifyToken, requireRegistered, requireAdmin } = require('../../middleware/auth');

const router = express.Router();

router.use(verifyToken, requireRegistered);

router.get('/user/:user_id', achievementController.getUserAchievements);
router.get('/', achievementController.getCatalog);

// Admin only
router.post('/', requireAdmin, achievementController.createAchievement);

module.exports = router;
