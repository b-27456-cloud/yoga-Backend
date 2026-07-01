const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Pose = require('./src/modules/poses/pose.model');

dotenv.config();

async function check() {
  await mongoose.connect(process.env.MONGODB_URI);
  const poses = await Pose.find({}, 'slug image_url video');
  console.log('Total poses:', poses.length);
  console.log(JSON.stringify(poses, null, 2));
  process.exit(0);
}
check();
