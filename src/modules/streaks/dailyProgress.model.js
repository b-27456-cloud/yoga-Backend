/**
 * Daily Progress Mongoose Model
 * Tracks user activity summarized by day.
 * Used for building calendars and history graphs without querying all sessions.
 */

const mongoose = require('mongoose');

const dailyProgressSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    date_string: {
      type: String, // Format: YYYY-MM-DD in the user's local timezone
      required: true,
    },
    sessions_completed: {
      type: Number,
      default: 0,
    },
    total_minutes: {
      type: Number,
      default: 0,
    },
    average_accuracy: {
      type: Number,
      default: 0,
    },
    is_frozen: {
      type: Boolean,
      default: false, // True if the user used a streak freeze on this day
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    toJSON: {
      transform(doc, ret) {
        ret.progress_id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Compound index for fast lookup of a user's specific day
dailyProgressSchema.index({ user_id: 1, date_string: 1 }, { unique: true });

const DailyProgress = mongoose.model('DailyProgress', dailyProgressSchema);

module.exports = DailyProgress;
