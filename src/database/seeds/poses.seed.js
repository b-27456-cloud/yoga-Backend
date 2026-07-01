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

// ─── BEGINNER POSES (level 1) ────────────────────────────────────────────────
// ─── INTERMEDIATE POSES (level 2) ────────────────────────────────────────────
// Warrior I, Warrior II, Triangle, Chair, Plank, Boat
const poses = [
  // ── BEGINNER POSES ─────────────────────────────────────────────────────────
  {
    name: 'Mountain Pose',
    slug: 'mountain-pose',
    description: 'Stand tall with a straight posture.',
    difficulty: 'beginner',
    level: 1,
    duration_seconds: 60,
    target_areas: ['whole body', 'core'],
    prerequisites: [],
    instructions: [
      'Stand with feet together or hip-width apart.',
      'Press evenly through the feet and lift through the crown of the head.',
      'Arms are at the sides with palms facing forward.'
    ],
    benefits: ['Improves posture', 'Enhances balance'],
    contraindications: [],
    reference_angles: {
      straight_body: { angle: 180, tolerance: 10, landmark_indices: [11, 23, 27] }
    },
    published: true,
  },
  {
    name: "Child's Pose",
    slug: 'childs-pose',
    description: 'Kneel and bend forward, resting forehead on the mat.',
    difficulty: 'beginner',
    level: 1,
    duration_seconds: 60,
    target_areas: ['back', 'hips', 'thighs'],
    prerequisites: [],
    instructions: [
      'Kneel on the floor, touching your big toes together.',
      'Sit on your heels, then separate your knees about as wide as your hips.',
      'Exhale and lay your torso down between your thighs.',
      'Rest your forehead on the mat and extend arms forward.'
    ],
    benefits: ['Relieves stress', 'Stretches the back'],
    contraindications: ['Knee injury', 'Pregnancy'],
    reference_angles: {
      hip_flexion: { angle: 30, tolerance: 15, landmark_indices: [11, 23, 25] }
    },
    published: true,
  },
  {
    name: 'Cat-Cow Pose',
    slug: 'cat-cow-pose',
    description: 'Alternate arching and rounding the back in sync with breathing.',
    difficulty: 'beginner',
    level: 1,
    duration_seconds: 60,
    target_areas: ['spine', 'neck', 'core'],
    prerequisites: [],
    instructions: [
      'Start on your hands and knees in a tabletop position.',
      'Inhale, drop your belly and lift your chest and tailbone (Cow).',
      'Exhale, round your spine and tuck your chin to your chest (Cat).',
      'Repeat for several breaths in a smooth, flowing rhythm.'
    ],
    benefits: ['Improves spinal flexibility', 'Relieves back pain'],
    contraindications: ['Neck injury'],
    reference_angles: {},
    published: true,
  },
  {
    name: 'Cobra Pose',
    slug: 'cobra-pose',
    description: 'Lie face down and lift your chest upward.',
    difficulty: 'beginner',
    level: 1,
    duration_seconds: 30,
    target_areas: ['back', 'chest', 'shoulders'],
    prerequisites: [],
    instructions: [
      'Lie face down on the floor with your legs extended back.',
      'Place your hands flat under your shoulders, elbows close to your body.',
      'Press the tops of your feet and thighs into the floor.',
      'Inhale and slowly lift your chest off the floor, keeping your elbows slightly bent.'
    ],
    benefits: ['Strengthens back muscles', 'Opens the chest'],
    contraindications: ['Back injury', 'Pregnancy'],
    reference_angles: {},
    published: true,
  },
  {
    name: 'Bridge Pose',
    slug: 'bridge-pose',
    description: 'Lie on your back and lift your hips upward.',
    difficulty: 'beginner',
    level: 1,
    duration_seconds: 45,
    target_areas: ['glutes', 'lower back', 'spine'],
    prerequisites: [],
    instructions: [
      'Lie on your back with knees bent and feet flat on the floor, hip-width apart.',
      'Press your arms into the floor alongside your body.',
      'Inhale and lift your hips toward the ceiling, squeezing your glutes.',
      'Hold the pose, keeping your thighs parallel to each other.'
    ],
    benefits: ['Strengthens glutes', 'Strengthens the lower back'],
    contraindications: ['Neck injury'],
    reference_angles: {},
    published: true,
  },
  {
    name: 'Seated Forward Bend',
    slug: 'seated-forward-bend',
    description: 'Sit and stretch forward to touch your toes.',
    difficulty: 'beginner',
    level: 1,
    duration_seconds: 60,
    target_areas: ['hamstrings', 'lower back'],
    prerequisites: [],
    instructions: [
      'Sit on the floor with your legs extended straight in front of you.',
      'Inhale and reach your arms up, lengthening your spine.',
      'Exhale and hinge at your hips, reaching forward toward your feet.',
      'Hold the pose and breathe deeply, relaxing further with each exhale.'
    ],
    benefits: ['Stretches the hamstrings', 'Improves digestion'],
    contraindications: ['Back injury'],
    reference_angles: {},
    published: true,
  },
  {
    name: 'Easy Pose',
    slug: 'easy-pose',
    description: 'Sit cross-legged with a straight spine.',
    difficulty: 'beginner',
    level: 1,
    duration_seconds: 300,
    target_areas: ['hips', 'back', 'knees'],
    prerequisites: [],
    instructions: [
      'Sit on the floor and cross your shins, placing each foot under the opposite knee.',
      'Rest your hands on your knees with palms facing up or down.',
      'Keep your spine straight and your shoulders relaxed.',
      'Close your eyes and breathe slowly and evenly.'
    ],
    benefits: ['Encourages meditation', 'Relaxes the mind'],
    contraindications: ['Knee injury'],
    reference_angles: {},
    published: true,
  },
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
      'Press your hands firmly into the mat and straighten your arms.',
      'Keep your knees slightly bent if needed, focusing on lengthening your spine.'
    ],
    benefits: ['Stretches the back of the legs', 'Strengthens arms and shoulders', 'Calms the brain'],
    contraindications: ['Carpal tunnel syndrome', 'Late-term pregnancy', 'High blood pressure'],
    reference_angles: {
      hip: { angle: 90, tolerance: 15, landmark_indices: [11, 23, 25] },
      shoulder: { angle: 180, tolerance: 20, landmark_indices: [13, 11, 23] }
    },
    published: true,
  },

  // ── INTERMEDIATE POSES ─────────────────────────────────────────────────────

  {
    name: 'Warrior',
    slug: 'warrior',
    description: 'Lunge with arms extended sideways, building strength and endurance.',
    difficulty: 'intermediate',
    level: 2,
    duration_seconds: 60,
    target_areas: ['legs', 'hips', 'chest', 'shoulders'],
    prerequisites: ['Mountain Pose'],
    instructions: [
      'Stand with your feet wide apart, about 4 feet.',
      'Turn your right foot out 90 degrees and your left foot in slightly.',
      'Bend your right knee directly over your right ankle.',
      'Extend your arms out to the sides, parallel to the floor, and gaze over your right hand.'
    ],
    benefits: ['Strengthens legs and arms', 'Boosts endurance'],
    contraindications: ['Recent hip or knee injury', 'High blood pressure'],
    reference_angles: {
      front_knee: { angle: 90, tolerance: 15, landmark_indices: [23, 25, 27] },
      arms_horizontal: { angle: 180, tolerance: 10, landmark_indices: [15, 11, 12, 16] }
    },
    published: true,
  },
  {
    name: 'Triangle Pose',
    slug: 'triangle-pose',
    description: 'Side bend with one arm touching the floor.',
    difficulty: 'intermediate',
    level: 2,
    duration_seconds: 45,
    target_areas: ['legs', 'hips', 'chest', 'spine'],
    prerequisites: ['Warrior II'],
    instructions: [
      'Stand with feet wide apart, right foot turned out 90 degrees.',
      'Extend your arms out to the sides at shoulder height.',
      'Hinge at your right hip, reaching your right hand toward your shin, ankle, or the floor.',
      'Extend your left arm straight toward the ceiling and gaze up at your top hand.'
    ],
    benefits: ['Stretches the sides', 'Improves balance'],
    contraindications: ['Low blood pressure'],
    reference_angles: {
      side_bend: { angle: 160, tolerance: 15, landmark_indices: [11, 23, 25] },
      arms_extended: { angle: 180, tolerance: 15, landmark_indices: [15, 11, 13] }
    },
    published: true,
  },
  {
    name: 'Chair Pose',
    slug: 'chair-pose',
    description: 'Half-squat position with arms raised overhead.',
    difficulty: 'intermediate',
    level: 2,
    duration_seconds: 45,
    target_areas: ['legs', 'glutes', 'core', 'shoulders'],
    prerequisites: ['Mountain Pose'],
    instructions: [
      'Stand in Mountain Pose with feet together or hip-width apart.',
      'Inhale and raise your arms overhead, palms facing each other.',
      'Exhale and bend your knees, lowering your hips as if sitting in a chair.',
      'Keep your weight in your heels and your chest lifted. Hold and breathe.'
    ],
    benefits: ['Strengthens the legs', 'Tones muscles'],
    contraindications: ['Knee injury', 'Low back pain'],
    reference_angles: {
      knee_bend: { angle: 90, tolerance: 20, landmark_indices: [23, 25, 27] },
      arms_overhead: { angle: 180, tolerance: 15, landmark_indices: [23, 11, 15] }
    },
    published: true,
  },
  {
    name: 'Plank Pose',
    slug: 'plank-pose',
    description: 'Hold a push-up position with a straight body line.',
    difficulty: 'intermediate',
    level: 2,
    duration_seconds: 30,
    target_areas: ['core', 'arms', 'shoulders', 'back'],
    prerequisites: [],
    instructions: [
      'Start on your hands and knees, then step your feet back one at a time.',
      'Align your wrists directly under your shoulders.',
      'Form a straight line from your head to your heels — do not let your hips sag or rise.',
      'Engage your core and hold, breathing steadily.'
    ],
    benefits: ['Builds core strength', 'Improves endurance'],
    contraindications: ['Wrist injury', 'Shoulder injury'],
    reference_angles: {
      straight_body: { angle: 180, tolerance: 10, landmark_indices: [11, 23, 27] },
      arms_straight: { angle: 180, tolerance: 10, landmark_indices: [13, 11, 15] }
    },
    published: true,
  },
  {
    name: 'Boat Pose',
    slug: 'boat-pose',
    description: 'Sit and lift your legs to form a "V" shape with your body.',
    difficulty: 'intermediate',
    level: 2,
    duration_seconds: 30,
    target_areas: ['core', 'hip flexors', 'spine'],
    prerequisites: ['Easy Pose'],
    instructions: [
      'Sit on the floor with your knees bent and feet flat.',
      'Lean back slightly, keeping your spine straight.',
      'Lift your feet off the floor until your shins are parallel to the ground.',
      'Extend your arms forward, parallel to the floor, and straighten your legs if possible to form a V-shape.'
    ],
    benefits: ['Strengthens the core', 'Aids digestion'],
    contraindications: ['Low back pain', 'Neck injury', 'Pregnancy'],
    reference_angles: {
      hip_flexion: { angle: 90, tolerance: 15, landmark_indices: [11, 23, 25] },
      legs_raised: { angle: 60, tolerance: 20, landmark_indices: [23, 25, 27] }
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
  },
];


async function seedPoses() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);

    console.log('Upserting poses (existing video URLs will NOT be overwritten)...');

    for (const pose of poses) {
      // Separate out the video field so we never accidentally wipe a real URL
      const { video, ...coreFields } = pose;

      const videoToSet = video || null;

      await Pose.findOneAndUpdate(
        { slug: pose.slug },
        {
          $set: coreFields,          // always update metadata (name, angles, etc.)
          $setOnInsert: { video: videoToSet },   // only set video when CREATING a new document
        },
        { upsert: true, new: true, runValidators: true }
      );
    }

    console.log(`Successfully upserted ${poses.length} poses!`);
  } catch (err) {
    console.error('Seeding failed:', err);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
  }
}

seedPoses();
