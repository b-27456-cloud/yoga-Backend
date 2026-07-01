require('dotenv').config({ path: '.env' });
const mongoose = require('mongoose');
const Pose = require('./src/modules/poses/pose.model');

async function cleanDB() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to DB');

  // Delete Advanced Poses
  const slugsToDelete = ['wheel-pose', 'crow-pose', 'headstand', 'warrior-i'];
  const delRes = await Pose.deleteMany({ slug: { $in: slugsToDelete } });
  console.log('Deleted advanced poses:', delRes.deletedCount);

  // Unset dummy images and videos
  const poses = await Pose.find({});
  let unsetCount = 0;
  for (let pose of poses) {
    let changed = false;
    if (pose.image_url && pose.image_url.includes('ui-avatars.com')) {
      pose.image_url = '';
      changed = true;
    }
    if (pose.video && pose.video.full_url && pose.video.full_url.includes('w3schools.com')) {
      pose.video.full_url = '';
      changed = true;
    }
    if (changed) {
      await pose.save();
      unsetCount++;
    }
  }
  console.log('Unset dummy data for', unsetCount, 'poses');
  
  await mongoose.disconnect();
}
cleanDB();
