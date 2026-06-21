/**
 * Notification Service
 */

const Notification = require('./notification.model');
const { AppError } = require('../../middleware/errorHandler');

async function getUserNotifications(user_id) {
  return Notification.find({ user_id })
    .sort({ created_at: -1 })
    .limit(50)
    .lean();
}

async function markAsRead(user_id, notification_id) {
  const notification = await Notification.findOneAndUpdate(
    { _id: notification_id, user_id },
    { read: true },
    { new: true }
  );

  if (!notification) {
    throw new AppError('Notification not found', 404);
  }

  return notification;
}

async function markAllAsRead(user_id) {
  await Notification.updateMany(
    { user_id, read: false },
    { read: true }
  );
  return { message: 'All notifications marked as read' };
}

async function createNotification({ user_id, title, body, type, metadata = {} }) {
  const notification = await Notification.create({
    user_id,
    title,
    body,
    type,
    metadata
  });
  return notification;
}

module.exports = {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  createNotification
};
