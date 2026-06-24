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
  },
  {
    name: 'Wheel Pose',
    slug: 'wheel-pose',
    description: 'A deep backbend that opens the chest and stretches the entire front body.',
    difficulty: 'intermediate',
    level: 3,
    duration_seconds: 40,
    target_areas: ['chest', 'shoulders', 'spine', 'hips'],
    prerequisites: ['Bridge Pose', 'Upward Facing Dog'],
    instructions: [
      'Lie on your back with knees bent and feet flat on the floor.',
      'Place your hands on the floor beside your head, fingers pointing toward shoulders.',
      'Press into your hands and feet to lift your hips and chest off the floor.',
      'Straighten your arms and legs as much as possible.'
    ],
    benefits: ['Stretches chest and lungs', 'Strengthens arms and wrists', 'Increases energy'],
    contraindications: ['Back injury', 'Carpal tunnel syndrome', 'High blood pressure'],
    reference_angles: {
      spine_extension: { angle: 120, tolerance: 30, landmark_indices: [11, 23, 25] },
      arms_extended: { angle: 160, tolerance: 20, landmark_indices: [15, 11, 23] }
    },
    published: true,
  },
  {
    name: 'Crow Pose',
    slug: 'crow-pose',
    description: 'An arm balance that strengthens the core and arms.',
    difficulty: 'advanced',
    level: 4,
    duration_seconds: 30,
    target_areas: ['arms', 'core', 'wrists'],
    prerequisites: ['Chaturanga', 'Plank Pose'],
    instructions: [
      'Start in a deep squat (Malasana).',
      'Place your hands on the floor in front of you, shoulder-width apart.',
      'Lift your hips and place your knees on the back of your upper arms.',
      'Lean forward and lift your feet off the floor, balancing on your hands.'
    ],
    benefits: ['Strengthens arms and wrists', 'Tones the abdominal core', 'Improves balance'],
    contraindications: ['Pregnancy', 'Carpal tunnel syndrome', 'Wrist pain'],
    reference_angles: {
      arms_bent: { angle: 90, tolerance: 15, landmark_indices: [11, 13, 15] },
      knees_tucked: { angle: 45, tolerance: 20, landmark_indices: [23, 25, 27] }
    },
    published: true,
  },
  {
    name: 'Headstand',
    slug: 'headstand',
    description: 'The king of all yoga poses, an inversion that rests on the forearms.',
    difficulty: 'advanced',
    level: 5,
    duration_seconds: 60,
    target_areas: ['core', 'shoulders', 'neck'],
    prerequisites: ['Dolphin Pose', 'Plank Pose'],
    instructions: [
      'Kneel on the floor and interlace your fingers, placing your forearms on the mat.',
      'Place the crown of your head on the floor, cradled by your hands.',
      'Lift your knees off the floor and walk your feet toward your elbows.',
      'Slowly lift your legs up until they are fully extended toward the ceiling.'
    ],
    benefits: ['Calms the brain', 'Strengthens the core and shoulders', 'Improves digestion'],
    contraindications: ['Neck injury', 'High blood pressure', 'Glaucoma'],
    reference_angles: {
      straight_body: { angle: 180, tolerance: 15, landmark_indices: [11, 23, 27] }
    },
    published: true,
  },
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
    benefits: ['Improves posture', 'enhances balance'],
    contraindications: [],
    reference_angles: {
      straight_body: { angle: 180, tolerance: 10, landmark_indices: [11, 23, 27] }
    },
    published: true,
  },
  {
    name: 'Child’s Pose',
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
    benefits: ['Relieves stress', 'stretches back'],
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
      'Inhale, drop your belly and lift your chest and tailbone.',
      'Exhale, round your spine and tuck your chin to your chest.',
      'Repeat for several breaths.'
    ],
    benefits: ['Improves spinal flexibility', 'relieves back pain'],
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
      'Place your hands under your shoulders.',
      'Press the tops of your feet and thighs into the floor.',
      'Inhale and lift your chest off the floor.'
    ],
    benefits: ['Strengthens back muscles', 'opens chest'],
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
      'Lie on your back with knees bent and feet flat on the floor.',
      'Press your arms into the floor and lift your hips toward the ceiling.',
      'Hold the pose, keeping your thighs parallel.'
    ],
    benefits: ['Strengthens glutes', 'Strengthens lower back'],
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
      'Exhale and hinge at your hips, reaching for your toes.',
      'Hold the pose and breathe deeply.'
    ],
    benefits: ['Stretches hamstrings', 'improves digestion'],
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
      'Sit on the floor with your legs crossed.',
      'Rest your hands on your knees.',
      'Keep your spine straight and shoulders relaxed.'
    ],
    benefits: ['Encourages meditation', 'relaxes mind'],
    contraindications: ['Knee injury'],
    reference_angles: {},
    published: true,
  },
  {
    name: 'Warrior I',
    slug: 'warrior-i',
    description: 'Lunge forward and raise arms overhead.',
    difficulty: 'intermediate',
    level: 2,
    duration_seconds: 60,
    target_areas: ['legs', 'arms', 'shoulders', 'chest'],
    prerequisites: ['Mountain Pose'],
    instructions: [
      'Start in Mountain Pose and step your left foot back.',
      'Turn your left foot out slightly and bend your right knee.',
      'Inhale and reach your arms up toward the ceiling.',
      'Keep your hips facing forward.'
    ],
    benefits: ['Builds leg strength', 'improves stamina'],
    contraindications: ['High blood pressure'],
    reference_angles: {},
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
      'Start in Warrior II with your right foot forward.',
      'Straighten your right leg and reach your right arm forward.',
      'Hinge at your hip and bring your right hand to your shin, ankle, or the floor.',
      'Extend your left arm toward the ceiling.'
    ],
    benefits: ['Stretches sides', 'improves balance'],
    contraindications: ['Low blood pressure'],
    reference_angles: {},
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
