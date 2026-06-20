/**
 * Firebase Admin SDK Configuration
 * Used for verifying Firebase ID tokens on every authenticated request.
 * Firebase handles password auth, email verification, and password reset client-side.
 */

const admin = require('firebase-admin');
const { config } = require('./environment');
const logger = require('../middleware/logging');

let firebaseInitialized = false;

/**
 * Initialize Firebase Admin SDK.
 * Accepts the service account JSON from env var (as a string)
 * or falls back to GOOGLE_APPLICATION_CREDENTIALS file.
 */
function initializeFirebase() {
  if (firebaseInitialized) return;

  try {
    if (config.firebaseServiceAccount) {
      // Parse inline JSON from environment variable
      const serviceAccount =
        typeof config.firebaseServiceAccount === 'string'
          ? JSON.parse(config.firebaseServiceAccount)
          : config.firebaseServiceAccount;

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      // Use default credentials from file path
      admin.initializeApp({
        credential: admin.credential.applicationDefault(),
      });
    } else {
      logger.warn(
        '⚠️  Firebase not configured — set FIREBASE_SERVICE_ACCOUNT or GOOGLE_APPLICATION_CREDENTIALS. ' +
        'Auth middleware will reject all requests.'
      );
      return;
    }

    firebaseInitialized = true;
    logger.info('🔥 Firebase Admin SDK initialized');
  } catch (err) {
    logger.error(`❌ Firebase initialization failed: ${err.message}`);
    // Don't crash — server can still serve health checks and unauthenticated routes
  }
}

/**
 * Check if Firebase is ready to verify tokens.
 */
function isFirebaseReady() {
  return firebaseInitialized;
}

module.exports = { admin, initializeFirebase, isFirebaseReady };
