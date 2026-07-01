const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Pose = require('./src/modules/poses/pose.model');

dotenv.config();

async function fix() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  const poses = await Pose.find({});
  for (const pose of poses) {
    let changed = false;
    if (!pose.image_url) {
      pose.image_url = `https://ui-avatars.com/api/?name=${encodeURIComponent(pose.name)}&background=random&size=512`;
      changed = true;
    }
    if (!pose.video || !pose.video.full_url) {
      pose.video = {
        full_url: 'https://www.w3schools.com/html/mov_bbb.mp4',
        duration: pose.duration_seconds || 60
      };
      changed = true;
    }
    if (changed) {
      await pose.save();
    }
  }
  
  console.log('Fixed missing images and videos.');
  process.exit(0);
}
fix();
