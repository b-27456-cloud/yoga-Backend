/**
 * Streak Routes
 * Mount path: /api/v1/streaks
 */

/**
 * @swagger
 * tags:
 *   name: Streaks
 *   description: User streak and consistency tracking
 */

const express = require('express');
const streakController = require('./streak.controller');
const { verifyToken, requireRegistered } = require('../../middleware/auth');

const router = express.Router();

router.use(verifyToken, requireRegistered);

/**
 * @swagger
 * /api/v1/streaks/user/{user_id}:
 *   get:
 *     summary: Get streak summary
 *     tags: [Streaks]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Streak summary
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Streak'
 */
router.get('/user/:user_id', streakController.getStreakSummary);
/**
 * @swagger
 * /api/v1/streaks/freeze:
 *   post:
 *     summary: Freeze streak
 *     tags: [Streaks]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Streak frozen successfully
 */
router.post('/freeze', streakController.freezeStreak);

module.exports = router;
