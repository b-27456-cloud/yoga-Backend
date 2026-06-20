/**
 * Music Routes
 * Mount path: /api/v1/music
 */

const express = require('express');
const musicController = require('./music.controller');
const { verifyToken, requireRegistered, requireAdmin } = require('../../middleware/auth');

const router = express.Router();

router.use(verifyToken, requireRegistered);

router.get('/recommend', musicController.recommendMusic);
router.get('/:id/stream', musicController.getStreamUrl);
router.get('/', musicController.getMusicList);

// Admin only
router.post('/', requireAdmin, musicController.addTrack);

module.exports = router;
