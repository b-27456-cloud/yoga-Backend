/**
 * Notification Controller
 */

const notificationService = require('./notification.service');

async function getUserNotifications(req, res, next) {
  try {
    const notifications = await notificationService.getUserNotifications(req.user.user_id);
    res.status(200).json({
      status: 'success',
      data: notifications,
    });
  } catch (err) {
    next(err);
  }
}

async function markAsRead(req, res, next) {
  try {
    const notification = await notificationService.markAsRead(req.user.user_id, req.params.id);
    res.status(200).json({
      status: 'success',
      data: notification,
    });
  } catch (err) {
    next(err);
  }
}

async function markAllAsRead(req, res, next) {
  try {
    const result = await notificationService.markAllAsRead(req.user.user_id);
    res.status(200).json({
      status: 'success',
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getUserNotifications,
  markAsRead,
  markAllAsRead
};
