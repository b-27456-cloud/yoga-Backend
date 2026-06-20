/**
 * User Mongoose Model
 * Core user profile stored in MongoDB.
 * Authentication is handled by Firebase — no password_hash field.
 * User is identified by `firebase_uid` from Firebase Auth.
 */

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    firebase_uid: {
      type: String,
      required: [true, 'Firebase UID is required'],
      unique: true,
      index: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      sparse: true,
      trim: true,
    },
    first_name: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
      maxlength: [50, 'First name cannot exceed 50 characters'],
    },
    last_name: {
      type: String,
      trim: true,
      maxlength: [50, 'Last name cannot exceed 50 characters'],
    },
    age: {
      type: Number,
      min: [13, 'Must be at least 13 years old'],
      max: [120, 'Invalid age'],
    },
    profile_photo_url: {
      type: String,
      default: null,
    },
    subscription: {
      status: {
        type: String,
        enum: ['free', 'premium'],
        default: 'free',
      },
      expires_at: {
        type: Date,
        default: null,
      },
    },
    accessibility: {
      profile: {
        type: String,
        enum: ['standard', 'elderly', 'injury_prone'],
        default: 'standard',
      },
      font_size: {
        type: String,
        enum: ['small', 'medium', 'large', 'xlarge'],
        default: 'medium',
      },
      theme: {
        type: String,
        enum: ['light', 'dark', 'high_contrast'],
        default: 'light',
      },
      voice_guidance: {
        type: Boolean,
        default: true,
      },
      haptic_feedback: {
        type: Boolean,
        default: true,
      },
    },
    settings: {
      language: {
        type: String,
        enum: ['en', 'ur', 'hi'],
        default: 'en',
      },
      notifications: {
        daily_reminder: { type: Boolean, default: true },
        streak_alerts: { type: Boolean, default: true },
        achievement_alerts: { type: Boolean, default: true },
      },
    },
    stats: {
      total_sessions: { type: Number, default: 0 },
      total_minutes: { type: Number, default: 0 },
      current_level: { type: Number, default: 1 },
    },
    privacy: {
      show_on_leaderboard: { type: Boolean, default: true },
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    deleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    toJSON: {
      transform(doc, ret) {
        ret.user_id = ret._id;
        delete ret._id;
        delete ret.__v;
        delete ret.deleted;
        return ret;
      },
    },
  }
);

// ---- Indexes ----
userSchema.index({ created_at: 1 });

// ---- Query Helpers ----
// Automatically exclude soft-deleted users from all queries
userSchema.pre(/^find/, function (next) {
  // Only apply if not explicitly querying for deleted users
  if (this.getFilter().deleted === undefined) {
    this.where({ deleted: { $ne: true } });
  }
  next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;
