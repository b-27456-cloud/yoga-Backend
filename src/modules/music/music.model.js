/**
 * Music Mongoose Model
 * Stores metadata and Cloudinary references for background audio tracks.
 */

const mongoose = require('mongoose');

const musicSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    artist: {
      type: String,
      required: true,
      trim: true,
    },
    genre: {
      type: String,
      required: true,
      index: true,
    },
    mood: {
      type: [String],
      index: true,
    },
    duration_seconds: {
      type: Number,
      required: true,
    },
    bpm: {
      type: Number,
      index: true,
    },
    audio_file: {
      url: { type: String, required: true }, // Cloudinary public ID
      size_mb: Number,
    },
    yoga_suitability: {
      suitable_for_levels: [String], // e.g., 'beginner', 'advanced'
      best_poses: [String],          // e.g., 'savasana', 'vinyasa'
      energy_level: {
        type: String,
        enum: ['low', 'medium', 'high'],
        index: true,
      },
    },
    metadata: {
      play_count: { type: Number, default: 0 },
      rating: { type: Number, default: 0 },
    },
    available: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    toJSON: {
      transform(doc, ret) {
        ret.music_id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// ---- Indexes ----
// Compound index for finding music by genre and mood
musicSchema.index({ genre: 1, mood: 1 });
// Text index for search functionality
musicSchema.index({ title: 'text', artist: 'text' });

const Music = mongoose.model('Music', musicSchema);

module.exports = Music;
