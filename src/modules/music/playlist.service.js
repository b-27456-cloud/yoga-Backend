/**
 * Playlist Service
 */

const Playlist = require('./playlist.model');
const { AppError } = require('../../middleware/errorHandler');

async function createPlaylist({ user_id, name, description }) {
  const playlist = await Playlist.create({ user_id, name, description });
  return playlist;
}

async function getUserPlaylists(user_id) {
  return Playlist.find({ user_id })
    .populate('tracks', 'title artist duration_seconds genre')
    .sort({ created_at: -1 })
    .lean();
}

async function addTrackToPlaylist(playlist_id, user_id, track_id) {
  const playlist = await Playlist.findOne({ _id: playlist_id, user_id });
  if (!playlist) {
    throw new AppError('Playlist not found', 404);
  }

  // Check if track already exists to prevent duplicates
  if (!playlist.tracks.includes(track_id)) {
    playlist.tracks.push(track_id);
    await playlist.save();
  }

  return playlist;
}

async function removeTrackFromPlaylist(playlist_id, user_id, track_id) {
  const playlist = await Playlist.findOne({ _id: playlist_id, user_id });
  if (!playlist) {
    throw new AppError('Playlist not found', 404);
  }

  playlist.tracks.pull(track_id);
  await playlist.save();
  return playlist;
}

module.exports = {
  createPlaylist,
  getUserPlaylists,
  addTrackToPlaylist,
  removeTrackFromPlaylist,
};
