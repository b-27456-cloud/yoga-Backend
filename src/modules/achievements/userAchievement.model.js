/**
 * User Achievement Model
 * Tracks which achievements a specific user has earned.
 */

const mongoose = require('mongoose');

const userAchievementSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    achievement_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Achievement',
      required: true,
    },
    earned_at: {
      type: Date,
      default: Date.now,
    },
    points_earned: {
      type: Number,
      required: true,
    },
    notified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    toJSON: {
      transform(doc, ret) {
        ret.user_achievement_id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Compound index for fast lookups and ensuring a user can't earn the exact same badge twice
userAchievementSchema.index({ user_id: 1, achievement_id: 1 }, { unique: true });

const UserAchievement = mongoose.model('UserAchievement', userAchievementSchema);

module.exports = UserAchievement;
