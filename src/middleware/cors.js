/**
 * CORS Configuration Middleware
 * Controls which origins can make requests to this API.
 */

const cors = require('cors');
const { config } = require('../config/environment');

/**
 * Build CORS options based on environment.
 * - Development: allow all origins
 * - Production: restrict to ALLOWED_ORIGINS env var
 */
function createCorsMiddleware() {
  const options = {
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    maxAge: 86400, // preflight cache for 24 hours
  };

  if (config.isProd && config.allowedOrigins.length > 0) {
    options.origin = (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, server-to-server)
      if (!origin || config.allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`Origin ${origin} not allowed by CORS`));
      }
    };
  } else {
    // Development: allow everything
    options.origin = true;
  }

  return cors(options);
}

module.exports = { createCorsMiddleware };
