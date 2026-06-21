/**
 * Cloud Storage Configuration (Cloudinary)
 * Handles media hosting for pose images, video tutorials, music files, user avatars.
 * Generates signed URLs for secure, time-limited access.
 */

const cloudinary = require('cloudinary').v2;
const { config } = require('./environment');
const logger = require('../middleware/logging');

let storageInitialized = false;

/**
 * Initialize Cloudinary with credentials.
 */
function initializeStorage() {
  const { cloudName, apiKey, apiSecret } = config.cloudinary;

  if (!cloudName || !apiKey || !apiSecret) {
    logger.warn(
      '⚠️  Cloudinary not configured — set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET. ' +
      'Media upload/stream endpoints will not work.'
    );
    return;
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });

  storageInitialized = true;
  logger.info('☁️  Cloudinary storage initialized');
}

/**
 * Generate a signed URL for a private Cloudinary resource.
 *
 * @param {string} publicId - The Cloudinary public ID of the resource
 * @param {Object} [options] - Additional Cloudinary options (resource_type, etc.)
 * @param {number} [expiresInSeconds=3600] - URL validity duration
 * @returns {string} Signed URL
 */
function getSignedUrl(publicId, options = {}, expiresInSeconds = 3600) {
  if (!storageInitialized) {
    throw new Error('Cloudinary is not initialized');
  }

  return cloudinary.url(publicId, {
    sign_url: true,
    type: 'upload', // Changed from 'authenticated' to support default uploads
    expires_at: Math.floor(Date.now() / 1000) + expiresInSeconds,
    ...options,
  });
}

/**
 * Check if storage is ready.
 */
function isStorageReady() {
  return storageInitialized;
}

module.exports = { cloudinary, initializeStorage, getSignedUrl, isStorageReady };
