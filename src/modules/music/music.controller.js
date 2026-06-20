/**
 * Music Controller
 */

const musicService = require('./music.service');

/**
 * Get list of music tracks
 * GET /api/v1/music
 */
async function getMusicList(req, res, next) {
  try {
    const result = await musicService.getMusicList(req.query);
    
    res.status(200).json({
      status: 'success',
      ...result,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Get music recommendations
 * GET /api/v1/music/recommend
 */
async function recommendMusic(req, res, next) {
  try {
    const { energy_level, pose_slug, limit } = req.query;
    const recommendations = await musicService.recommendMusic({ energy_level, pose_slug, limit });
    
    res.status(200).json({
      status: 'success',
      data: recommendations,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Get streaming URL for a track
 * GET /api/v1/music/:id/stream
 */
async function getStreamUrl(req, res, next) {
  try {
    const result = await musicService.getStreamUrl(req.params.id);
    
    res.status(200).json({
      status: 'success',
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Admin: Add new track
 * POST /api/v1/music
 */
async function addTrack(req, res, next) {
  try {
    const track = await musicService.addTrack(req.body);
    
    res.status(201).json({
      status: 'success',
      data: track,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getMusicList,
  recommendMusic,
  getStreamUrl,
  addTrack,
};
