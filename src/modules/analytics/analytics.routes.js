/**
 * Analytics Routes
 * Mount path: /api/v1/analytics
 */

/**
 * @swagger
 * tags:
 *   name: Analytics
 *   description: User progress and analytics dashboard
 */

const express = require('express');
const analyticsController = require('./analytics.controller');
const { verifyToken, requireRegistered } = require('../../middleware/auth');

const router = express.Router();

router.use(verifyToken, requireRegistered);

// Apply ownership check to all routes under /user/:user_id
router.use('/user/:user_id', analyticsController.checkOwnership);

/**
 * @swagger
 * /api/v1/analytics/user/{user_id}/daily:
 *   get:
 *     summary: Get daily stats
 *     tags: [Analytics]
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
 *         description: Daily stats
 */
router.get('/user/:user_id/daily', analyticsController.getDailyStats);
/**
 * @swagger
 * /api/v1/analytics/user/{user_id}/weekly:
 *   get:
 *     summary: Get weekly stats
 *     tags: [Analytics]
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
 *         description: Weekly stats
 */
router.get('/user/:user_id/weekly', analyticsController.getWeeklyStats);
/**
 * @swagger
 * /api/v1/analytics/user/{user_id}/stats:
 *   get:
 *     summary: Get dashboard stats
 *     tags: [Analytics]
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
 *         description: High-level dashboard stats
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     streak:
 *                       type: number
 *                     longest_streak:
 *                       type: number
 *                     total_minutes:
 *                       type: number
 *                     total_sessions:
 *                       type: number
 *                     favorite_pose:
 *                       type: object
 */
router.get('/user/:user_id/stats', analyticsController.getDashboardStats);
/**
 * @swagger
 * /api/v1/analytics/user/{user_id}/insights:
 *   get:
 *     summary: Get motivational insights
 *     tags: [Analytics]
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
 *         description: Array of string insights
 */
router.get('/user/:user_id/insights', analyticsController.getInsights);

module.exports = router;
