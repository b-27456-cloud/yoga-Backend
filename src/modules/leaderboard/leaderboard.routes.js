/**
 * Leaderboard Routes
 * Mount path: /api/v1/leaderboard
 */

const express = require('express');
const leaderboardController = require('./leaderboard.controller');
const { verifyToken, requireRegistered } = require('../../middleware/auth');

const router = express.Router();

router.use(verifyToken, requireRegistered);

router.get('/global', leaderboardController.getGlobalLeaderboard);

module.exports = router;
