/**
 * Express Application Setup
 * Middleware ordering: cors → helmet → logging → rateLimiter → routes → errorHandler
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const morgan = require('morgan');
const Sentry = require('@sentry/node');
const { nodeProfilingIntegration } = require('@sentry/profiling-node');

const config = require('./config/environment');
const { apiLimiter } = require('./middleware/rateLimiter');
const { errorHandler, AppError } = require('./middleware/errorHandler');
const logger = require('./middleware/logging');
const { isDBHealthy } = require('./config/database');
const { isFirebaseReady } = require('./config/firebase');
const { isStorageReady } = require('./config/storage');

const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');

const app = express();

// ==========================================
// 1. ERROR TRACKING (SENTRY)
// Initialize Sentry as early as possible
// ==========================================
Sentry.init({
  dsn: process.env.SENTRY_DSN || '',
  integrations: [
    nodeProfilingIntegration(),
  ],
  tracesSampleRate: 1.0,
  profilesSampleRate: 1.0,
});
// The request handler must be the first middleware on the app
Sentry.setupExpressErrorHandler(app);

// ==========================================
// 2. SECURITY MIDDLEWARES
// ==========================================
// Set security HTTP headers
app.use(helmet());

// Enable CORS
app.use(cors({
  origin: config.corsOrigin,
  credentials: true,
}));

// ==========================================
// 3. BODY PARSERS
// ==========================================
app.use(express.json({ limit: '10mb' }));    // 10MB for landmark data payloads
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// ==========================================
// 4. REQUEST LOGGING (Morgan → Winston)
// ==========================================
app.use(morgan('combined', { stream: logger.morganStream }));

// ==========================================
// 5. RATE LIMITING
// ==========================================
app.use('/api/v1', apiLimiter);

// ==========================================
// 6. HEALTH CHECK ROUTES (no auth required)
// ==========================================

/**
 * GET /health — Basic liveness check
 * Returns 200 if the server process is running.
 */
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

/**
 * GET /health/ready — Readiness check
 * Returns 200 only if all dependencies (DB, Firebase, Storage) are connected.
 * Used by Render / load balancers to know when the service can accept traffic.
 */
app.get('/health/ready', (req, res) => {
  const checks = {
    database: isDBHealthy(),
    firebase: isFirebaseReady(),
    storage: isStorageReady(),
  };

  const allReady = Object.values(checks).every(Boolean);

  res.status(allReady ? 200 : 503).json({
    status: allReady ? 'ready' : 'not_ready',
    checks,
    timestamp: new Date().toISOString(),
  });
});

/**
 * GET /health/live — Kubernetes-style liveness probe
 * Returns 200 if the process is alive and the DB is connected.
 */
app.get('/health/live', (req, res) => {
  const dbHealthy = isDBHealthy();

  res.status(dbHealthy ? 200 : 503).json({
    status: dbHealthy ? 'alive' : 'degraded',
    database: dbHealthy,
    timestamp: new Date().toISOString(),
  });
});

// ==========================================
// 7. API ROUTES (to be added in later phases)
// ==========================================

const authRoutes = require('./modules/auth/auth.routes');
const poseRoutes = require('./modules/poses/pose.routes');
const sessionRoutes = require('./modules/sessions/session.routes');
const streakRoutes = require('./modules/streaks/streak.routes');
const musicRoutes = require('./modules/music/music.routes');
const achievementRoutes = require('./modules/achievements/achievement.routes');
const analyticsRoutes = require('./modules/analytics/analytics.routes');
const userRoutes = require('./modules/users/user.routes');
const leaderboardRoutes = require('./modules/leaderboard/leaderboard.routes');

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/poses', poseRoutes);
app.use('/api/v1/sessions', sessionRoutes);
app.use('/api/v1/streaks', streakRoutes);
app.use('/api/v1/music', musicRoutes);
app.use('/api/v1/achievements', achievementRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/leaderboard', leaderboardRoutes);

// ==========================================
// 8. API DOCUMENTATION (SWAGGER)
// ==========================================
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ==========================================
// 9. 404 HANDLER — Catch unmatched routes
// ==========================================
app.use((req, res, next) => {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404));
});

// ==========================================
// 9. GLOBAL ERROR HANDLER (must be last)
// ==========================================
app.use(errorHandler);

module.exports = app;
