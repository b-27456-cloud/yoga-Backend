/**
 * FCM Service (Firebase Cloud Messaging)
 * Handles sending push notifications to users.
 */

const admin = require('../../config/firebase');
const logger = require('../middleware/logging');
const Notification = require('../modules/notifications/notification.model');
const User = require('../modules/auth/auth.model');

/**
 * Sends a push notification via Firebase and stores it in the database.
 * @param {string} user_id - The internal MongoDB user ID
 * @param {string} title - Notification title
 * @param {string} body - Notification body
 * @param {string} type - Notification type ('streak', 'badge', 'reminder', 'system')
 * @param {object} metadata - Extra payload data
 */
async function sendNotification(user_id, title, body, type, metadata = {}) {
  try {
    const user = await User.findById(user_id).lean();
    if (!user || user.deleted) return;

    // Check user settings
    if (type === 'streak' && !user.settings?.notifications?.streak_alerts) return;
    if (type === 'badge' && !user.settings?.notifications?.achievement_alerts) return;
    if (type === 'reminder' && !user.settings?.notifications?.daily_reminder) return;

    // 1. Save to database
    await Notification.create({
      user_id,
      title,
      body,
      type,
      metadata,
    });

    // 2. Send via FCM if we have an FCM token.
    // Assuming the frontend saves an `fcm_token` field on the user profile during login.
    if (user.fcm_token) {
      const message = {
        notification: {
          title,
          body,
        },
        data: {
          type,
          ...metadata,
        },
        token: user.fcm_token,
      };

      await admin.messaging().send(message);
      logger.info('FCM notification sent successfully', { user_id, type });
    } else {
      logger.debug('Skipped FCM send: No token available for user', { user_id });
    }
  } catch (error) {
    logger.error('Error sending notification', { user_id, error: error.message });
  }
}

module.exports = {
  sendNotification,
};
