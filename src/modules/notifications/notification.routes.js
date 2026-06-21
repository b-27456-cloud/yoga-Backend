/**
 * Notification Routes
 * Mount path: /api/v1/notifications
 */

const express = require('express');
const notificationController = require('./notification.controller');
const { verifyToken, requireRegistered } = require('../../middleware/auth');

const router = express.Router();

router.use(verifyToken, requireRegistered);

router.get('/', notificationController.getUserNotifications);
router.put('/read-all', notificationController.markAllAsRead);
router.put('/:id/read', notificationController.markAsRead);

module.exports = router;
