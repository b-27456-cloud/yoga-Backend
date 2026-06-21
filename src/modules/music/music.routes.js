/**
 * Music Routes
 * Mount path: /api/v1/music
 */

/**
 * @swagger
 * tags:
 *   name: Music
 *   description: Background music and streaming endpoints
 */

const express = require('express');
const musicController = require('./music.controller');
const { verifyToken, requireRegistered, requireAdmin } = require('../../middleware/auth');

const router = express.Router();

router.use(verifyToken, requireRegistered);

/**
 * @swagger
 * /api/v1/music/recommend:
 *   get:
 *     summary: Get recommended music
 *     tags: [Music]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: energy_level
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: pose_slug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of recommended music tracks
 */
router.get('/recommend', musicController.recommendMusic);
/**
 * @swagger
 * /api/v1/music/{id}/stream:
 *   get:
 *     summary: Get stream URL
 *     tags: [Music]
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
 *         description: Signed stream URL
 */
router.get('/:id/stream', musicController.getStreamUrl);
/**
 * @swagger
 * /api/v1/music:
 *   get:
 *     summary: Get music list
 *     tags: [Music]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of all music tracks
 */
router.get('/', musicController.getMusicList);

// Admin only

/**
 * @swagger
 * /api/v1/music:
 *   post:
 *     summary: Add a music track (Admin only)
 *     tags: [Music]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Music'
 *     responses:
 *       201:
 *         description: Track added
 */
router.post('/', requireAdmin, musicController.addTrack);

module.exports = router;
