/**
 * Session Routes
 * Mount path: /api/v1/sessions
 */

/**
 * @swagger
 * tags:
 *   name: Sessions
 *   description: User practice session endpoints
 */

const express = require('express');
const sessionController = require('./session.controller');
const { verifyToken, requireRegistered } = require('../../middleware/auth');

const router = express.Router();

// All session routes require authentication and a registered MongoDB profile
router.use(verifyToken, requireRegistered);

// Core Session Flow

/**
 * @swagger
 * /api/v1/sessions/start:
 *   post:
 *     summary: Start a session
 *     tags: [Sessions]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               pose_id:
 *                 type: string
 *               music_id:
 *                 type: string
 *     responses:
 *       201:
 *         description: Session started
 */
router.post('/start', sessionController.startSession);
/**
 * @swagger
 * /api/v1/sessions/{id}/log-frame:
 *   post:
 *     summary: Log a frame for a session
 *     tags: [Sessions]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               landmarks:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/Landmark'
 *     responses:
 *       200:
 *         description: Frame logged
 */
router.post('/:id/log-frame', sessionController.logFrame);
/**
 * @swagger
 * /api/v1/sessions/{id}/end:
 *   post:
 *     summary: End a session
 *     tags: [Sessions]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Session ended
 */
router.post('/:id/end', sessionController.endSession);

// History and details

/**
 * @swagger
 * /api/v1/sessions/user/{user_id}:
 *   get:
 *     summary: Get user session history
 *     tags: [Sessions]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *     responses:
 *       200:
 *         description: Session history
 */
router.get('/user/:user_id', sessionController.getUserHistory);
/**
 * @swagger
 * /api/v1/sessions/{id}:
 *   get:
 *     summary: Get session by ID
 *     tags: [Sessions]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Session details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Session'
 */
router.get('/:id', sessionController.getSessionById);

module.exports = router;
