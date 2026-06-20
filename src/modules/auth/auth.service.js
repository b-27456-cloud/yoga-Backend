/**
 * Auth Service
 * Business logic for authentication — user creation, lookup, profile management.
 * Firebase handles passwords/tokens; this service manages the MongoDB user profile.
 */

const User = require('./auth.model');
const logger = require('../../middleware/logging');

/**
 * Register a new user in MongoDB.
 * Called after Firebase ID token is verified — the user already exists in Firebase.
 *
 * @param {Object} params
 * @param {string} params.firebase_uid - From verified Firebase ID token
 * @param {string} params.email - From verified Firebase ID token
 * @param {string} params.first_name
 * @param {string} [params.last_name]
 * @param {string} [params.phone]
 * @param {number} params.age
 * @param {string} [params.accessibility_profile]
 * @returns {Promise<Object>} Created user document
 */
async function registerUser({ firebase_uid, email, first_name, last_name, phone, age, accessibility_profile }) {
  // Check if user already exists (by firebase_uid or email)
  const existing = await User.findOne({
    $or: [{ firebase_uid }, { email }],
  });

  if (existing) {
    const field = existing.firebase_uid === firebase_uid ? 'Firebase account' : 'email';
    const error = new Error(`User already registered with this ${field}`);
    error.statusCode = 409;
    error.isOperational = true;
    throw error;
  }

  const user = await User.create({
    firebase_uid,
    email,
    first_name,
    last_name: last_name || '',
    phone: phone || null,
    age,
    accessibility: {
      profile: accessibility_profile || 'standard',
    },
  });

  logger.info('New user registered', { user_id: user._id, email });
  return user;
}

/**
 * Find user by Firebase UID.
 * Used during login — Firebase authenticates, we return the MongoDB profile.
 *
 * @param {string} firebase_uid
 * @returns {Promise<Object|null>} User document or null
 */
async function findByFirebaseUid(firebase_uid) {
  return User.findOne({ firebase_uid });
}

/**
 * Find user by MongoDB ObjectId.
 *
 * @param {string} userId - MongoDB _id
 * @returns {Promise<Object|null>}
 */
async function findById(userId) {
  return User.findById(userId);
}

/**
 * Update user profile.
 *
 * @param {string} userId - MongoDB _id
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} Updated user document
 */
async function updateProfile(userId, updates) {
  const user = await User.findByIdAndUpdate(
    userId,
    { $set: flattenObject(updates) },
    { new: true, runValidators: true }
  );

  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    error.isOperational = true;
    throw error;
  }

  return user;
}

/**
 * Soft-delete a user (GDPR compliance).
 *
 * @param {string} userId - MongoDB _id
 * @returns {Promise<void>}
 */
async function softDeleteUser(userId) {
  const user = await User.findByIdAndUpdate(userId, {
    deleted: true,
    email: `deleted_${userId}@yogaflow.deleted`,  // free up the email
    firebase_uid: `deleted_${userId}`,             // free up the uid
  });

  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    error.isOperational = true;
    throw error;
  }

  logger.info('User soft-deleted', { user_id: userId });
}

/**
 * Flatten a nested object for MongoDB $set operations.
 * { accessibility: { theme: 'dark' } } → { 'accessibility.theme': 'dark' }
 */
function flattenObject(obj, prefix = '') {
  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
      Object.assign(result, flattenObject(value, path));
    } else {
      result[path] = value;
    }
  }
  return result;
}

module.exports = {
  registerUser,
  findByFirebaseUid,
  findById,
  updateProfile,
  softDeleteUser,
};
