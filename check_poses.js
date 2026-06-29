/**
 * check_poses.js  —  scratch script, run once and delete
 * Prints a table showing which poses have image_url and video.full_url
 */
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Pose = require('./src/modules/poses/pose.model');

dotenv.config({ path: path.resolve(__dirname, '.env') });

async function check() {
  await mongoose.connect(process.env.MONGODB_URI);
  const poses = await Pose.find({}).sort({ level: 1, name: 1 }).lean();

  console.log('\nPose Media Status\n' + '═'.repeat(72));
  console.log(
    'NAME'.padEnd(28) + 'IMAGE'.padEnd(10) + 'VIDEO'.padEnd(10) + 'STATUS'
  );
  console.log('─'.repeat(72));

  const incomplete = [];
  for (const p of poses) {
    const hasImage = !!(p.image_url && p.image_url.trim());
    const hasVideo = !!(p.video && p.video.full_url && p.video.full_url.trim());
    const status = hasImage && hasVideo ? '✅ complete' : '❌ MISSING';
    if (!hasImage || !hasVideo) incomplete.push(p.name);
    console.log(
      p.name.padEnd(28) +
      (hasImage ? '✅' : '❌').padEnd(10) +
      (hasVideo ? '✅' : '❌').padEnd(10) +
      status
    );
  }

  console.log('─'.repeat(72));
  console.log(`\n${poses.length} poses total.`);
  if (incomplete.length) {
    console.log(`\n⚠️  INCOMPLETE (missing image or video):`);
    incomplete.forEach(n => console.log(`   • ${n}`));
  } else {
    console.log('\n🎉 All poses have both image and video!');
  }

  await mongoose.disconnect();
}

check().catch(console.error);
