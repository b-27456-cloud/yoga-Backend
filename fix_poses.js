/**
 * fix_poses.js
 *
 * 1. Uploads the numbered beginner images with correct pose mappings
 * 2. Transfers warrior video URL from warrior-ii → warrior doc
 * 3. Deletes stale docs: warrior-i, warrior-ii, wheel-pose, crow-pose, headstand
 *
 * Usage: node fix_poses.js
 */

const cloudinary = require('cloudinary').v2;
const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Pose = require('./src/modules/poses/pose.model');

dotenv.config({ path: path.resolve(__dirname, '.env') });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const ASSETS_DIR = path.join(__dirname, 'assets');

// Map each numbered image file → exact pose slug in DB
const IMAGE_MAP = {
  'image2.png':  'childs-pose',
  'image3.png':  'cat-cow-pose',
  'image4.png':  'cobra-pose',
  'image5.png':  'bridge-pose',
  'image6.png':  'tree-pose',
  'image7.png':  'seated-forward-bend',
  'image8.png':  'easy-pose',
  'image9.png':  'warrior-i',      // will be deleted after, used for warrior-i only
  'image10.png': 'warrior',        // arms-sideways = Warrior (renamed from Warrior II)
  'image11.png': 'triangle-pose',  // duplicate — already uploaded as triangle pose.png
};

// Slugs to permanently delete from DB
const SLUGS_TO_DELETE = [
  'warrior-i',    // user only wants one "Warrior" pose
  'warrior-ii',   // renamed to 'warrior'
  'wheel-pose',   // removed from design
  'crow-pose',    // removed from design
  'headstand',    // removed from design
];

async function fix() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Connected to MongoDB\n');

  // ── Step 1: Transfer warrior-ii video → warrior ───────────────────────────
  const warriorII  = await Pose.findOne({ slug: 'warrior-ii' });
  const warriorNew = await Pose.findOne({ slug: 'warrior' });

  if (warriorII && warriorNew && warriorII.video?.full_url) {
    await Pose.updateOne(
      { slug: 'warrior' },
      {
        $set: {
          'video.full_url': warriorII.video.full_url,
          'video.duration': warriorII.video.duration,
        },
      }
    );
    console.log('✅ Transferred video URL: warrior-ii → warrior');
  } else if (warriorNew?.video?.full_url) {
    console.log('ℹ️  warrior already has video — skipping transfer');
  }

  // ── Step 2: Upload numbered images ───────────────────────────────────────
  console.log('\n═══════════ Uploading Numbered Images ═══════════');
  for (const [file, slug] of Object.entries(IMAGE_MAP)) {
    const pose = await Pose.findOne({ slug });
    if (!pose) {
      console.log(`⚠️  [SKIP] "${file}" — pose "${slug}" not in DB`);
      continue;
    }

    // Skip if already has an image
    if (pose.image_url) {
      console.log(`⏭️  [SKIP] "${file}" — "${pose.name}" already has image`);
      continue;
    }

    const filePath = path.join(ASSETS_DIR, file);
    console.log(`⬆️  Uploading "${file}" → "${pose.name}"...`);

    try {
      const upload = await cloudinary.uploader.upload(filePath, {
        resource_type: 'image',
        folder: 'yogaflow_poses_images',
        public_id: `image_${slug}`,
        overwrite: true,
      });

      await Pose.updateOne(
        { _id: pose._id },
        { $set: { image_url: upload.secure_url } }
      );
      console.log(`   ✅ Attached: ${upload.secure_url}`);
    } catch (err) {
      console.error(`   ❌ Failed: ${err.message}`);
    }
  }

  // ── Step 3: Delete stale poses ────────────────────────────────────────────
  console.log('\n═══════════ Removing Stale Poses ════════════════');
  for (const slug of SLUGS_TO_DELETE) {
    const result = await Pose.deleteOne({ slug });
    if (result.deletedCount) {
      console.log(`🗑️  Deleted: ${slug}`);
    } else {
      console.log(`⚠️  Not found (already removed): ${slug}`);
    }
  }

  // ── Final audit ───────────────────────────────────────────────────────────
  console.log('\n═══════════ Final Pose Status ═══════════════════');
  const poses = await Pose.find({}).sort({ level: 1, name: 1 }).lean();
  console.log('NAME'.padEnd(28) + 'IMAGE  VIDEO');
  console.log('─'.repeat(44));
  for (const p of poses) {
    const img = p.image_url ? '✅' : '❌';
    const vid = p.video?.full_url ? '✅' : '❌';
    console.log(`${p.name.padEnd(28)}${img}      ${vid}`);
  }
  console.log(`\n${poses.length} poses remaining.`);

  await mongoose.disconnect();
  console.log('\nDone. MongoDB disconnected.');
}

fix().catch(console.error);
