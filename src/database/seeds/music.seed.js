const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const mongoose = require('mongoose');
const Music = require('../../modules/music/music.model');

const dummyTracks = [
  {
    title: 'Morning Flow',
    artist: 'Zen Sounds',
    genre: 'Ambient',
    mood: ['calm', 'focus'],
    duration_seconds: 300,
    bpm: 60,
    audio_file: {
      // Used your exact Cloudinary Public ID with .mp3 extension:
      url: 'Shining_feat._Leon_Albertson_Adryon_de_Le%C3%B3n_-_Leon_Albertson_feat._Adryon_de_Le%C3%B3n_h4vae7.mp3',  
      size_mb: 4.5,
    },
    yoga_suitability: {
      suitable_for_levels: ['beginner', 'intermediate'],
      best_poses: ['savasana'],
      energy_level: 'low',
    },
  },
  {
    title: 'Vinyasa Energy',
    artist: 'Yoga Beats',
    genre: 'Electronic',
    mood: ['energetic', 'uplifting'],
    duration_seconds: 240,
    bpm: 110,
    audio_file: {
      url: 'samples/electronic_1',
      size_mb: 6.2,
    },
    yoga_suitability: {
      suitable_for_levels: ['intermediate', 'advanced'],
      best_poses: ['chaturanga'],
      energy_level: 'high',
    },
  }
];

async function seed() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);

    console.log('Clearing existing music tracks...');
    await Music.deleteMany({});

    console.log('Inserting seed data...');
    await Music.insertMany(dummyTracks);

    console.log(`Successfully seeded ${dummyTracks.length} music tracks!`);
    process.exit(0);
  } catch (err) {
    console.error('Error seeding data:', err);
    process.exit(1);
  }
}

seed();
