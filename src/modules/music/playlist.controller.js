/**
 * Playlist Controller
 */

const playlistService = require('./playlist.service');

async function createPlaylist(req, res, next) {
  try {
    const { name, description } = req.body;
    const user_id = req.user.user_id; // From requireRegistered middleware

    const playlist = await playlistService.createPlaylist({ user_id, name, description });

    res.status(201).json({
      status: 'success',
      data: playlist,
    });
  } catch (err) {
    next(err);
  }
}

async function getUserPlaylists(req, res, next) {
  try {
    // Check ownership if fetching for a specific user
    const targetUserId = req.params.user_id;
    if (req.user.user_id.toString() !== targetUserId && req.user.role !== 'admin') {
      return res.status(403).json({ status: 'error', message: 'Forbidden' });
    }

    const playlists = await playlistService.getUserPlaylists(targetUserId);

    res.status(200).json({
      status: 'success',
      data: playlists,
    });
  } catch (err) {
    next(err);
  }
}

async function addTrack(req, res, next) {
  try {
    const playlist = await playlistService.addTrackToPlaylist(
      req.params.id,
      req.user.user_id,
      req.body.music_id
    );

    res.status(200).json({
      status: 'success',
      data: playlist,
    });
  } catch (err) {
    next(err);
  }
}

async function removeTrack(req, res, next) {
  try {
    const playlist = await playlistService.removeTrackFromPlaylist(
      req.params.id,
      req.user.user_id,
      req.params.track_id
    );

    res.status(200).json({
      status: 'success',
      data: playlist,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createPlaylist,
  getUserPlaylists,
  addTrack,
  removeTrack,
};
