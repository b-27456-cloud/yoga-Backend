/**
 * Playlist Mongoose Model
 * Stores user-created collections of music tracks.
 */

const mongoose = require('mongoose');

const playlistSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    tracks: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Music',
      }
    ],
    is_public: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    toJSON: {
      transform(doc, ret) {
        ret.playlist_id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

const Playlist = mongoose.model('Playlist', playlistSchema);

module.exports = Playlist;
