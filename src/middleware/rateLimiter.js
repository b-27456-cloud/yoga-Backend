/**
 * Rate Limiting Middleware
 * Protects against brute-force and DDoS attacks.
 * Uses express-rate-limit (in-memory — resets on Render restart).
 */

const rateLimit = require('express-rate-limit');

/**
 * General API rate limiter.
 * 100 requests per minute per IP.
 */
const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100,
  standardHeaders: true,  // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false,   // Disable `X-RateLimit-*` headers
  message: {
    status: 'error',
    message: 'Too many requests, please try again later.',
    errors: [],
  },
});

/**
 * Stricter limiter for auth routes.
 * 20 requests per 15 minutes per IP.
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'error',
    message: 'Too many authentication attempts, please try again later.',
    errors: [],
  },
});

module.exports = { apiLimiter, authLimiter };
