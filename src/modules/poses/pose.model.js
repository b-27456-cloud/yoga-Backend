/**
 * Pose Mongoose Model
 * Stores yoga poses with metadata, reference angles for AI comparison, and video links.
 */

const mongoose = require('mongoose');

const referenceAngleSchema = new mongoose.Schema({
  angle: { type: Number, required: true },
  tolerance: { type: Number, required: true },
  landmark_indices: { type: [Number], required: true },
}, { _id: false });

const modificationSchema = new mongoose.Schema({
  description: String,
  imageUrl: String,
}, { _id: false });

const poseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Pose name is required'],
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    difficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      required: true,
    },
    level: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },
    duration_seconds: {
      type: Number,
      default: 60,
    },
    target_areas: [String],
    prerequisites: [String],
    instructions: [String],
    benefits: [String],
    contraindications: [String],
    reference_angles: {
      type: Map,
      of: referenceAngleSchema,
    },
    modifications: {
      beginner: modificationSchema,
      elderly: modificationSchema,
      injury_prone: modificationSchema,
    },
    video: {
      full_url: String,
      duration: Number,
      narration: {
        english: String,
        urdu: String,
        hindi: String,
      },
      subtitles: {
        english: String,
        urdu: String,
        hindi: String,
      },
    },
    published: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    toJSON: {
      transform(doc, ret) {
        ret.pose_id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// ---- Indexes ----
poseSchema.index({ difficulty: 1 });
poseSchema.index({ level: 1 });
poseSchema.index({ target_areas: 1 });
poseSchema.index({ name: 'text', description: 'text', target_areas: 'text' });

const Pose = mongoose.model('Pose', poseSchema);

module.exports = Pose;
