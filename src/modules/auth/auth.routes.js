/**
 * Auth Routes
 * Mount path: /api/v1/auth
 */

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication and user onboarding endpoints
 */

const express = require('express');
const authController = require('./auth.controller');
const { verifyToken, requireRegistered } = require('../../middleware/auth');
const { authLimiter } = require('../../middleware/rateLimiter');
const { validate, registerSchema } = require('./auth.validation');

const router = express.Router();

// Apply stricter rate limiting to all auth routes
router.use(authLimiter);

/**
 * @swagger
 * /api/v1/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     description: Creates a new user account in Firebase and MongoDB. Does not return a token.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - first_name
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               first_name:
 *                 type: string
 *               last_name:
 *                 type: string
 *               phone:
 *                 type: string
 *               age:
 *                 type: number
 *               accessibility_profile:
 *                 type: string
 *                 enum: [standard, elderly, injury_prone]
 *     responses:
 *       201:
 *         description: User profile created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Validation error
 *       429:
 *         description: Too many requests
 */
// 1. Register: validates body
router.post(
  '/register',
  validate(registerSchema),
  authController.register
);

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     description: Authenticates a user using email and password, returning a Firebase ID token.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 token:
 *                   type: string
 *                   description: Firebase ID token
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Invalid credentials
 */
// 2. Login: takes email and password in body
router.post(
  '/login',
  authController.login
);

/**
 * @swagger
 * /api/v1/auth/logout:
 *   post:
 *     summary: Logout user
 *     tags: [Auth]
 *     security:
 *       - BearerAuth: []
 *     description: Signals logout on the server side.
 *     responses:
 *       200:
 *         description: Logged out successfully
 *       401:
 *         description: Unauthorized
 */
// 3. Logout: requires Firebase token
router.post(
  '/logout',
  verifyToken,
  authController.logout
);

/**
 * @swagger
 * /api/v1/auth/me:
 *   get:
 *     summary: Get current user profile
 *     tags: [Auth]
 *     security:
 *       - BearerAuth: []
 *     description: Fetch the currently authenticated user's full profile using the stored token.
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 */
// 4. Me: requires Firebase token AND must be registered in MongoDB
router.get(
  '/me',
  verifyToken,
  requireRegistered,
  authController.me
);

module.exports = router;
