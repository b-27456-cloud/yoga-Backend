/**
 * Environment Configuration
 * Validates and exports all environment variables.
 * Fails fast on startup if required variables are missing.
 */

const dotenv = require('dotenv');
const path = require('path');

// Load .env file (only in non-production — Render injects env vars directly)
if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: path.resolve(__dirname, '../../.env') });
}

const requiredVars = ['MONGODB_URI'];

/**
 * Validate that all required environment variables are set.
 * Throws on missing vars to fail fast at startup.
 */
function validateEnv() {
  const missing = requiredVars.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
      'Copy .env.example to .env and fill in the values.'
    );
  }
}

const config = {
  // Server
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 5000,
  isDev: (process.env.NODE_ENV || 'development') === 'development',
  isProd: process.env.NODE_ENV === 'production',

  // MongoDB
  mongoUri: process.env.MONGODB_URI,

  // Firebase
  firebaseServiceAccount: process.env.FIREBASE_SERVICE_ACCOUNT,
  firebaseWebApi: process.env.FIREBASE_WEB_API_KEY,

  // Cloudinary
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  },

  // CORS
  allowedOrigins: process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim())
    : [],

  // Logging
  logLevel: process.env.LOG_LEVEL || 'info',

  // Sentry (optional)
  sentryDsn: process.env.SENTRY_DSN || null,
};

module.exports = { config, validateEnv };
