/**
 * MongoDB Atlas Connection
 * - Retry logic on initial connection failure
 * - Automatic reconnection on disconnect
 * - Event logging for connection lifecycle
 */

const mongoose = require('mongoose');
const { config } = require('./environment');
const logger = require('../middleware/logging');

const RETRY_DELAY_MS = 5000;
const MAX_RETRIES = 5;

/**
 * Connect to MongoDB Atlas with retry logic.
 * Mongoose 8 handles reconnection automatically after initial connect,
 * but we add retries for the first connection attempt.
 */
async function connectDB(retries = MAX_RETRIES) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await mongoose.connect(config.mongoUri, {
        // Mongoose 8 defaults are sensible; override only what we need
        serverSelectionTimeoutMS: 10000,  // 10s timeout to find a server
        heartbeatFrequencyMS: 10000,      // check server health every 10s
      });

      logger.info('✅ MongoDB Atlas connected successfully');
      return;
    } catch (err) {
      logger.error(
        `❌ MongoDB connection attempt ${attempt}/${retries} failed: ${err.message}`
      );

      if (attempt === retries) {
        logger.error('💀 All MongoDB connection retries exhausted. Exiting.');
        process.exit(1);
      }

      logger.info(`⏳ Retrying in ${RETRY_DELAY_MS / 1000}s...`);
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
    }
  }
}

// ---- Connection event listeners (auto-reconnect monitoring) ----

mongoose.connection.on('connected', () => {
  logger.info('🔗 Mongoose connected to MongoDB Atlas');
});

mongoose.connection.on('disconnected', () => {
  logger.warn('⚡ Mongoose disconnected from MongoDB Atlas — driver will auto-reconnect');
});

mongoose.connection.on('error', (err) => {
  logger.error(`🔴 Mongoose connection error: ${err.message}`);
});

// Graceful shutdown
async function disconnectDB() {
  await mongoose.connection.close();
  logger.info('🛑 MongoDB connection closed gracefully');
}

/**
 * Check if the database connection is healthy.
 * Returns true if connected, false otherwise.
 */
function isDBHealthy() {
  // mongoose.connection.readyState: 0=disconnected, 1=connected, 2=connecting, 3=disconnecting
  return mongoose.connection.readyState === 1;
}

module.exports = { connectDB, disconnectDB, isDBHealthy };
