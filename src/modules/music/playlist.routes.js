/**
 * Playlist Routes
 * Mount path: /api/v1/playlists
 */

const express = require('express');
const playlistController = require('./playlist.controller');
const { verifyToken, requireRegistered } = require('../../middleware/auth');

const router = express.Router();

router.use(verifyToken, requireRegistered);

router.post('/', playlistController.createPlaylist);
router.post('/:id/tracks', playlistController.addTrack);
router.delete('/:id/tracks/:track_id', playlistController.removeTrack);

module.exports = router;
