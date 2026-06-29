/**
 * User Service
 * Manages profile updates, settings, favorites, and soft delete.
 */

const User = require('../auth/auth.model');
const { AppError } = require('../../middleware/errorHandler');

/**
 * Get user profile
 */
async function getProfile(user_id) {
  const user = await User.findById(user_id).lean();
  if (!user) throw new AppError('User not found', 404);
  return user;
}

/**
 * Update user profile
 */
async function updateProfile(user_id, updateData) {
  // Prevent updating sensitive fields
  delete updateData.firebase_uid;
  delete updateData.role;
  delete updateData.deleted;
  delete updateData.subscription;
  delete updateData.stats;

  const user = await User.findByIdAndUpdate(user_id, updateData, {
    new: true,
    runValidators: true,
  }).lean();

  if (!user) throw new AppError('User not found', 404);
  return user;
}

/**
 * Update user settings
 */
async function updateSettings(user_id, settingsData) {
  const user = await User.findById(user_id);
  if (!user) throw new AppError('User not found', 404);

  // Deep-merge top-level settings fields.
  // A shallow spread would overwrite nested objects (e.g. notifications)
  // with undefined if the client omits them, causing Mongoose validation errors.
  if (settingsData.language !== undefined) {
    user.settings.language = settingsData.language;
  }

  if (settingsData.notifications !== undefined && typeof settingsData.notifications === 'object') {
    // Merge individual notification flags — never replace the whole sub-document
    const notif = settingsData.notifications;
    if (notif.daily_reminder !== undefined)     user.settings.notifications.daily_reminder     = notif.daily_reminder;
    if (notif.streak_alerts !== undefined)      user.settings.notifications.streak_alerts      = notif.streak_alerts;
    if (notif.achievement_alerts !== undefined) user.settings.notifications.achievement_alerts = notif.achievement_alerts;
  }

  user.markModified('settings');
  await user.save();

  return user.settings;
}

/**
 * Soft delete user account
 */
async function softDeleteUser(user_id) {
  const user = await User.findById(user_id);
  if (!user) throw new AppError('User not found', 404);

  user.deleted = true;
  // Obfuscate PII for GDPR compliance while keeping analytics intact
  user.first_name = 'Deleted';
  user.last_name = 'User';
  user.email = `deleted_${Date.now()}@yogaflow.internal`;
  user.phone = null;
  user.profile_photo_url = null;
  user.firebase_uid = `deleted_${user.firebase_uid}`; // Break the link
  
  await user.save();
  return { message: 'User account deleted successfully' };
}

const Favorite = require('./favorite.model');

async function addFavorite(user_id, item_id, item_type) {
  try {
    const fav = await Favorite.create({ user_id, item_id, item_type });
    return fav;
  } catch (err) {
    if (err.code === 11000) return { message: 'Already in favorites' };
    throw err;
  }
}

async function removeFavorite(user_id, item_id) {
  await Favorite.findOneAndDelete({ user_id, item_id });
  return { message: 'Removed from favorites' };
}

async function getFavorites(user_id) {
  return Favorite.find({ user_id }).sort({ created_at: -1 }).lean();
}

module.exports = {
  getProfile,
  updateProfile,
  updateSettings,
  softDeleteUser,
  addFavorite,
  removeFavorite,
  getFavorites,
};
