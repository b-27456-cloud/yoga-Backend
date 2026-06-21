/**
 * Streak Mongoose Model
 * Tracks user consistency and progress over time.
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Streak:
 *       type: object
 *       properties:
 *         streak_id:
 *           type: string
 *         user_id:
 *           type: string
 *         current_streak:
 *           type: number
 *         longest_streak:
 *           type: number
 *         last_session_date:
 *           type: string
 *           format: date-time
 *         streak_start_date:
 *           type: string
 *           format: date-time
 *         total_days_practiced:
 *           type: number
 *         total_minutes_practiced:
 *           type: number
 *         available_freezes:
 *           type: number
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 */

const mongoose = require('mongoose');

const streakSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    current_streak: {
      type: Number,
      default: 0,
    },
    longest_streak: {
      type: Number,
      default: 0,
    },
    last_session_date: {
      type: Date,
      default: null,
    },
    streak_start_date: {
      type: Date,
      default: null,
    },
    total_days_practiced: {
      type: Number,
      default: 0,
    },
    total_minutes_practiced: {
      type: Number,
      default: 0,
    },
    available_freezes: {
      type: Number,
      default: 0, // Users can earn these through achievements
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    toJSON: {
      transform(doc, ret) {
        ret.streak_id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Indexes
streakSchema.index({ current_streak: -1 }); // Useful for leaderboards

const Streak = mongoose.model('Streak', streakSchema);

module.exports = Streak;
