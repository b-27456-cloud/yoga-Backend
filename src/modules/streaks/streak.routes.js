/**
 * Streak Routes
 * Mount path: /api/v1/streaks
 */

const express = require('express');
const streakController = require('./streak.controller');
const { verifyToken, requireRegistered } = require('../../middleware/auth');

const router = express.Router();

router.use(verifyToken, requireRegistered);

router.get('/user/:user_id', streakController.getStreakSummary);
router.post('/freeze', streakController.freezeStreak);

module.exports = router;
