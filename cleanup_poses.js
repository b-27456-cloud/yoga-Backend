/**
 * cleanup_poses.js
 * 
 * 1. Deletes all stale/old poses that should no longer exist:
 *    Wheel Pose, Crow Pose, Headstand (removed from design)
 *    Warrior II (old slug — replaced by 'Warrior' and 'Warrior I')
 *    Warrior (new doc created by seed but has no media yet — handled via Warrior slug)
 *
 * 2. Copies the video_url from old warrior-ii doc to the new warrior slug doc.
 *
 * 3. Removes Mountain Pose and Downward Facing Dog as user requested
 *    (they are the 2 poses missing an image).
 *
 * Usage: node cleanup_poses.js
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Pose = require('./src/modules/poses/pose.model');

dotenv.config({ path: path.resolve(__dirname, '.env') });

async function cleanup() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Connected to MongoDB\n');

  // ── Step 1: Rescue warrior video URL from old warrior-ii doc ─────────────
  const warriorII   = await Pose.findOne({ slug: 'warrior-ii' });
  const warriorNew  = await Pose.findOne({ slug: 'warrior' });

  if (warriorII && warriorNew) {
    // Copy video URL and image from warrior-ii → warrior (the properly named one)
    await Pose.updateOne(
      { slug: 'warrior' },
      {
        $set: {
          'video.full_url': warriorII.video?.full_url,
          'video.duration': warriorII.video?.duration,
          image_url: warriorII.image_url,
        },
      }
    );
    console.log('✅ Rescued media from warrior-ii → warrior');
  }

  // ── Step 2: Delete stale / removed poses ─────────────────────────────────
  const toDelete = [
    'warrior-ii',      // renamed to 'warrior'
    'warrior-i',       // only one warrior pose needed — user specified just "Warrior"
    'wheel-pose',      // removed from design
    'crow-pose',       // removed from design
    'headstand',       // removed from design
    'downward-facing-dog', // missing image — user said remove the 2 incomplete
    'mountain-pose',       // missing image — user said remove the 2 incomplete
  ];

  for (const slug of toDelete) {
    const result = await Pose.deleteOne({ slug });
    if (result.deletedCount) {
      console.log(`🗑️  Deleted: ${slug}`);
    } else {
      console.log(`⚠️  Not found (already gone?): ${slug}`);
    }
  }

  console.log('\n✅ Cleanup complete.');
  await mongoose.disconnect();
  console.log('Disconnected from MongoDB.');
}

cleanup().catch(console.error);
