/**
 * Auth Routes
 * Mount path: /api/v1/auth
 */

const express = require('express');
const authController = require('./auth.controller');
const { verifyToken, requireRegistered } = require('../../middleware/auth');
const { authLimiter } = require('../../middleware/rateLimiter');
const { validate, registerSchema } = require('./auth.validation');

const router = express.Router();

// Apply stricter rate limiting to all auth routes
router.use(authLimiter);

// 1. Register: validates body
router.post(
  '/register',
  validate(registerSchema),
  authController.register
);

// 2. Login: takes email and password in body
router.post(
  '/login',
  authController.login
);

// 3. Logout: requires Firebase token
router.post(
  '/logout',
  verifyToken,
  authController.logout
);

// 4. Me: requires Firebase token AND must be registered in MongoDB
router.get(
  '/me',
  verifyToken,
  requireRegistered,
  authController.me
);

module.exports = router;
