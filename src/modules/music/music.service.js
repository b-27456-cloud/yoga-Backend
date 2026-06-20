/**
 * Music Service
 * Business logic for music filtering, recommendations, and streaming URLs.
 */

const Music = require('./music.model');
const { getSignedUrl } = require('../../config/storage');
const { AppError } = require('../../middleware/errorHandler');
const logger = require('../../middleware/logging');

/**
 * Get paginated list of music tracks with optional filtering.
 */
async function getMusicList({ page = 1, limit = 20, genre, mood, bpm_min, bpm_max, search }) {
  const query = { available: true };

  if (genre) query.genre = genre;
  if (mood) query.mood = mood; // MongoDB matches if array contains the element
  
  if (bpm_min || bpm_max) {
    query.bpm = {};
    if (bpm_min) query.bpm.$gte = Number(bpm_min);
    if (bpm_max) query.bpm.$lte = Number(bpm_max);
  }

  let mongoQuery = Music.find(query);

  if (search) {
    query.$text = { $search: search };
    mongoQuery = mongoQuery.sort({ score: { $meta: 'textScore' } });
  } else {
    mongoQuery = mongoQuery.sort({ created_at: -1 });
  }

  const skip = (page - 1) * limit;

  const [tracks, total] = await Promise.all([
    mongoQuery.skip(skip).limit(Number(limit)).lean(),
    Music.countDocuments(query),
  ]);

  return {
    tracks,
    meta: {
      total,
      page: Number(page),
      limit: Number(limit),
      pages: Math.ceil(total / limit),
    },
  };
}

/**
 * Recommend music based on energy level or specific pose suitability.
 */
async function recommendMusic({ energy_level, pose_slug, limit = 5 }) {
  const query = { available: true };

  if (energy_level) {
    query['yoga_suitability.energy_level'] = energy_level;
  }
  
  if (pose_slug) {
    query['yoga_suitability.best_poses'] = pose_slug;
  }

  // Use MongoDB $sample to get random recommendations from the matching subset
  const recommendations = await Music.aggregate([
    { $match: query },
    { $sample: { size: Number(limit) } },
    { $project: { _id: 0, music_id: '$_id', title: 1, artist: 1, duration_seconds: 1, genre: 1, 'yoga_suitability.energy_level': 1 } }
  ]);

  return recommendations;
}

/**
 * Generate a signed Cloudinary URL to securely stream the audio track.
 * Also increments the play count.
 */
async function getStreamUrl(musicId) {
  const track = await Music.findById(musicId);
  if (!track || !track.available) {
    throw new AppError('Track not found or unavailable', 404);
  }

  try {
    // Cloudinary considers audio to be a "video" resource type for URL generation
    const signedUrl = getSignedUrl(track.audio_file.url, { resource_type: 'video' }, 7200);

    // Increment play count asynchronously
    track.metadata.play_count += 1;
    track.save().catch(err => logger.warn(`Failed to increment play count for ${musicId}: ${err.message}`));

    return {
      music_id: track._id,
      title: track.title,
      artist: track.artist,
      stream_url: signedUrl,
      expires_in: 7200,
    };
  } catch (err) {
    logger.error('Error generating stream URL', { error: err.message, music_id: musicId });
    throw new AppError('Could not generate streaming URL', 500);
  }
}

/**
 * Admin: Add a new music track.
 */
async function addTrack(data) {
  const track = await Music.create(data);
  logger.info('New music track added', { music_id: track._id });
  return track;
}

module.exports = {
  getMusicList,
  recommendMusic,
  getStreamUrl,
  addTrack,
};
