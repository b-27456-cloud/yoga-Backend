/**
 * Session Mongoose Model
 * Tracks a user's practice session, storing accuracy and landmarks over time.
 */

const mongoose = require('mongoose');

const landmarkSchema = new mongoose.Schema({
  x: { type: Number, required: true },
  y: { type: Number, required: true },
  z: { type: Number, required: true },
  visibility: { type: Number, required: true },
}, { _id: false });

const frameDataSchema = new mongoose.Schema({
  timestamp: { type: Date, required: true },
  landmarks: [landmarkSchema],
  angles: {
    type: Map,
    of: Number,
  },
  accuracy: { type: Number, required: true },
}, { _id: false });

const sessionSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    pose_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Pose',
      required: true,
      index: true,
    },
    music_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Music',
      default: null,
    },
    duration_seconds: {
      type: Number,
      default: 0,
    },
    start_time: {
      type: Date,
      required: true,
    },
    end_time: {
      type: Date,
      default: null,
    },
    accuracy_average: {
      type: Number,
      default: 0,
    },
    accuracy_timeline: [Number],
    landmarks_data: [frameDataSchema],
    completed: {
      type: Boolean,
      default: false,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    toJSON: {
      transform(doc, ret) {
        ret.session_id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// ---- Indexes ----
sessionSchema.index({ user_id: 1, created_at: -1 });

const Session = mongoose.model('Session', sessionSchema);

module.exports = Session;
