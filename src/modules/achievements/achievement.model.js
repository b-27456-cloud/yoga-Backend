/**
 * Achievement Catalog Model
 * Stores the definitions for badges and achievements.
 */

const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    icon_url: {
      type: String,
      required: true,
    },
    condition: {
      // Determines how the background job evaluates this badge
      type: {
        type: String,
        enum: ['streak_days', 'total_sessions', 'average_accuracy', 'total_minutes'],
        required: true,
      },
      value: {
        type: Number,
        required: true,
      },
    },
    points_reward: {
      type: Number,
      default: 10,
    },
    category: {
      type: String,
      enum: ['consistency', 'mastery', 'exploration'],
      required: true,
    },
    rarity: {
      type: String,
      enum: ['common', 'rare', 'epic', 'legendary'],
      default: 'common',
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    toJSON: {
      transform(doc, ret) {
        ret.achievement_id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Indexes
achievementSchema.index({ category: 1 });
achievementSchema.index({ rarity: 1 });

const Achievement = mongoose.model('Achievement', achievementSchema);

module.exports = Achievement;
