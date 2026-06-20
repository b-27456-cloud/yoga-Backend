/**
 * Analytics Routes
 * Mount path: /api/v1/analytics
 */

const express = require('express');
const analyticsController = require('./analytics.controller');
const { verifyToken, requireRegistered } = require('../../middleware/auth');

const router = express.Router();

router.use(verifyToken, requireRegistered);

// Apply ownership check to all routes under /user/:user_id
router.use('/user/:user_id', analyticsController.checkOwnership);

router.get('/user/:user_id/daily', analyticsController.getDailyStats);
router.get('/user/:user_id/weekly', analyticsController.getWeeklyStats);
router.get('/user/:user_id/stats', analyticsController.getDashboardStats);
router.get('/user/:user_id/insights', analyticsController.getInsights);

module.exports = router;
