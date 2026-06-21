/**
 * Playlist Routes
 * Mount path: /api/v1/playlists
 */

/**
 * @swagger
 * tags:
 *   name: Playlists
 *   description: User music playlist management
 */

const express = require('express');
const playlistController = require('./playlist.controller');
const { verifyToken, requireRegistered } = require('../../middleware/auth');

const router = express.Router();

router.use(verifyToken, requireRegistered);

/**
 * @swagger
 * /api/v1/playlists:
 *   post:
 *     summary: Create a playlist
 *     tags: [Playlists]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Playlist created
 */
router.post('/', playlistController.createPlaylist);
/**
 * @swagger
 * /api/v1/playlists/{id}/tracks:
 *   post:
 *     summary: Add track to playlist
 *     tags: [Playlists]
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
 *               music_id:
 *                 type: string
 *     responses:
 *       200:
 *         description: Track added
 */
router.post('/:id/tracks', playlistController.addTrack);
/**
 * @swagger
 * /api/v1/playlists/{id}/tracks/{track_id}:
 *   delete:
 *     summary: Remove track from playlist
 *     tags: [Playlists]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: track_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Track removed
 */
router.delete('/:id/tracks/:track_id', playlistController.removeTrack);

module.exports = router;
