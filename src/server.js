/**
 * YogaFlow Backend — Entry Point
 * Initializes all services and starts the Express server.
 */

const { validateEnv, config } = require('./config/environment');
const { connectDB, disconnectDB } = require('./config/database');
const { initializeFirebase } = require('./config/firebase');
const { initializeStorage } = require('./config/storage');
const logger = require('./middleware/logging');
const app = require('./app');
const { initStreakCronJobs } = require('./jobs/streak.job');
const { initAnalyticsCronJobs } = require('./jobs/analytics.job');
const { initLeaderboardCronJobs } = require('./jobs/leaderboard.job');

async function startServer() {
  try {
    // 1. Validate environment variables (fail fast)
    validateEnv();
    
    // Connect to database first
    await connectDB();

    // Initialize cron jobs
    initStreakCronJobs();
    initAnalyticsCronJobs();
    initLeaderboardCronJobs();
    logger.info(`🌍 Environment: ${config.nodeEnv}`);

    // 2. Connect to MongoDB Atlas
    await connectDB();

    // 3. Initialize Firebase Admin SDK
    initializeFirebase();

    // 4. Initialize Cloudinary storage
    initializeStorage();

    // 5. Register cron jobs (Phase 5+)
    // require('./jobs');

    // 6. Start HTTP server
    const server = app.listen(config.port, () => {
      logger.info(`🚀 YogaFlow backend running on port ${config.port}`);
      logger.info(`📋 Health check: http://localhost:${config.port}/health`);
    });

    // ---- Graceful shutdown ----
    const shutdown = async (signal) => {
      logger.info(`\n${signal} received — shutting down gracefully...`);
      server.close(async () => {
        await disconnectDB();
        logger.info('👋 Server shut down.');
        process.exit(0);
      });

      // Force exit after 10s if graceful shutdown hangs
      setTimeout(() => {
        logger.error('Graceful shutdown timed out — forcing exit');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    // Catch unhandled rejections and uncaught exceptions
    process.on('unhandledRejection', (reason) => {
      logger.error('Unhandled Rejection:', reason);
    });

    process.on('uncaughtException', (err) => {
      logger.error('Uncaught Exception:', err);
      // Exit on uncaught exceptions — process is in an undefined state
      process.exit(1);
    });

  } catch (err) {
    logger.error(`💀 Failed to start server: ${err.message}`);
    process.exit(1);
  }
}

startServer();
