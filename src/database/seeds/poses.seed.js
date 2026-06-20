/**
 * Seed Script for Poses
 * Usage: node src/database/seeds/poses.seed.js
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Pose = require('../../modules/poses/pose.model');

// Load env vars
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const poses = [
  {
    name: 'Downward Facing Dog',
    slug: 'downward-facing-dog',
    description: 'An inverted V-shape pose that stretches the entire body.',
    difficulty: 'beginner',
    level: 1,
    duration_seconds: 60,
    target_areas: ['hamstrings', 'calves', 'shoulders', 'hands'],
    prerequisites: [],
    instructions: [
      'Start on all fours with wrists under shoulders and knees under hips.',
      'Tuck your toes under and lift your hips up and back.',
      'Press your hands into the mat and straighten your arms.',
      'Keep your knees slightly bent if needed, aiming to lengthen your spine.'
    ],
    benefits: ['Stretches the back of the legs', 'Strengthens arms and shoulders', 'Calms the brain'],
    contraindications: ['Carpal tunnel syndrome', 'Late-term pregnancy', 'High blood pressure'],
    reference_angles: {
      hip: { angle: 90, tolerance: 15, landmark_indices: [11, 23, 25] },
      shoulder: { angle: 180, tolerance: 20, landmark_indices: [13, 11, 23] }
    },
    published: true,
  },
  {
    name: 'Warrior II',
    slug: 'warrior-ii',
    description: 'A standing pose that builds strength and stamina.',
    difficulty: 'beginner',
    level: 1,
    duration_seconds: 60,
    target_areas: ['legs', 'hips', 'chest', 'shoulders'],
    prerequisites: ['Mountain Pose'],
    instructions: [
      'Stand with feet wide apart.',
      'Turn your right foot out 90 degrees and your left foot in slightly.',
      'Bend your right knee until it is directly over your right ankle.',
      'Raise your arms parallel to the floor and gaze over your right hand.'
    ],
    benefits: ['Strengthens legs and ankles', 'Opens chest and lungs', 'Increases stamina'],
    contraindications: ['Recent hip or knee injury', 'Diarrhea', 'High blood pressure'],
    reference_angles: {
      front_knee: { angle: 90, tolerance: 15, landmark_indices: [23, 25, 27] },
      arms_horizontal: { angle: 180, tolerance: 10, landmark_indices: [15, 11, 12, 16] }
    },
    published: true,
  },
  {
    name: 'Tree Pose',
    slug: 'tree-pose',
    description: 'A balancing pose that improves focus and stability.',
    difficulty: 'beginner',
    level: 1,
    duration_seconds: 45,
    target_areas: ['legs', 'core', 'ankles'],
    prerequisites: ['Mountain Pose'],
    instructions: [
      'Stand tall and shift your weight onto your left leg.',
      'Place your right foot on your inner left thigh or calf (avoid the knee).',
      'Bring your hands together at your chest.',
      'Find a focal point to help you balance.'
    ],
    benefits: ['Improves balance', 'Strengthens ankles and calves', 'Enhances focus'],
    contraindications: ['Low blood pressure', 'Insomnia', 'Headache'],
    reference_angles: {
      bent_knee: { angle: 45, tolerance: 20, landmark_indices: [23, 25, 27] }
    },
    published: true,
  }
];

async function seedPoses() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    
    console.log('Clearing existing poses...');
    await Pose.deleteMany({});
    
    console.log('Inserting seed data...');
    await Pose.insertMany(poses);
    
    console.log(`Successfully seeded ${poses.length} poses!`);
  } catch (err) {
    console.error('Seeding failed:', err);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
  }
}

seedPoses();
