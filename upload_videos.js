/**
 * upload_videos.js
 *
 * Auto-detects all video AND image files in /assets, matches them to poses
 * in the database by filename, uploads to Cloudinary, and stores the URL
 * on the pose document using a direct updateOne (bypasses save() validation).
 *
 * Usage: node upload_videos.js
 */

const cloudinary = require('cloudinary').v2;
const fs = require('fs');
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

const VIDEO_EXTENSIONS = ['.mov', '.mp4', '.avi', '.mkv', '.webm'];
const IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.webp', '.jfif'];
const ASSETS_DIR = path.join(__dirname, 'assets');

/**
 * Normalise a string for loose matching:
 * lowercase, strip punctuation, collapse whitespace.
 */
function normalise(str) {
  return str
    .toLowerCase()
    .replace(/[''`]/g, '')    // apostrophes
    .replace(/[-_]/g, ' ')    // hyphens / underscores → space
    .replace(/[^a-z0-9 ]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Alias map: normalised filename → normalised DB pose name.
 * Add entries here whenever a filename is too far from the DB name.
 */
const ALIASES = {
  'downward dog':       'downward facing dog',
  'downward facing dog pose': 'downward facing dog',
  'seated forward bent':'seated forward bend',
  'warrior pose':       'warrior',  // maps to renamed 'Warrior' pose
  'child pose':         'childs pose',
};

async function uploadAndAttach() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Connected to MongoDB\n');

  // Load all poses from DB once, keyed by normalised name
  const allPoses = await Pose.find({});
  const poseMap = new Map(allPoses.map(p => [normalise(p.name), p]));

  // Scan assets/ and split files into videos and images
  const allFiles = fs.readdirSync(ASSETS_DIR);
  const videoFiles = allFiles.filter(f => VIDEO_EXTENSIONS.includes(path.extname(f).toLowerCase()));
  const imageFiles = allFiles.filter(f => IMAGE_EXTENSIONS.includes(path.extname(f).toLowerCase()));

  // Skip the old numbered images (image2.png, image3.png …)
  const namedImages = imageFiles.filter(f => !/^image\d+\./i.test(f));

  console.log(`Found ${videoFiles.length} video(s) and ${namedImages.length} named image(s)\n`);

  const results = { success: [], skipped: [], failed: [] };

  // ── Helper: resolve pose from filename ──────────────────────────────────
  function resolvepose(file) {
    const ext      = path.extname(file);
    const baseName = path.basename(file, ext);
    const normFile = normalise(baseName);
    const lookupKey = ALIASES[normFile] ?? normFile;
    return { lookupKey, pose: poseMap.get(lookupKey) };
  }

  // ── 1. Upload VIDEOS ─────────────────────────────────────────────────────
  if (videoFiles.length) {
    console.log('═══════════════════ VIDEOS ═══════════════════════');
    for (const file of videoFiles) {
      const { lookupKey, pose } = resolvepose(file);

      if (!pose) {
        console.log(`⚠️  [SKIP] "${file}" — no DB match for "${lookupKey}"`);
        results.skipped.push({ file, reason: `No DB match for "${lookupKey}"` });
        continue;
      }

      const filePath = path.join(ASSETS_DIR, file);
      console.log(`⬆️  Uploading "${file}" → Pose: "${pose.name}"...`);

      try {
        const upload = await cloudinary.uploader.upload(filePath, {
          resource_type: 'video',
          folder: 'yogaflow_poses_videos',
          public_id: `video_${pose.slug}`,
          overwrite: true,
        });

        // Use updateOne + $set to avoid triggering full save() validation
        await Pose.updateOne(
          { _id: pose._id },
          {
            $set: {
              'video.full_url': upload.secure_url,
              'video.duration': upload.duration ? Math.round(upload.duration) : undefined,
            },
          }
        );

        console.log(`   ✅ Attached: ${upload.secure_url}\n`);
        results.success.push({ file, pose: pose.name, url: upload.secure_url });

      } catch (err) {
        console.error(`   ❌ Failed for "${file}": ${err.message}\n`);
        results.failed.push({ file, error: err.message });
      }
    }
  }

  // ── 2. Upload IMAGES ─────────────────────────────────────────────────────
  if (namedImages.length) {
    console.log('\n═══════════════════ IMAGES ═══════════════════════');
    for (const file of namedImages) {
      const { lookupKey, pose } = resolvepose(file);

      if (!pose) {
        console.log(`⚠️  [SKIP] "${file}" — no DB match for "${lookupKey}"`);
        results.skipped.push({ file, reason: `No DB match for "${lookupKey}"` });
        continue;
      }

      const filePath = path.join(ASSETS_DIR, file);
      console.log(`⬆️  Uploading "${file}" → Pose: "${pose.name}"...`);

      try {
        const upload = await cloudinary.uploader.upload(filePath, {
          resource_type: 'image',
          folder: 'yogaflow_poses_images',
          public_id: `image_${pose.slug}`,
          overwrite: true,
        });

        await Pose.updateOne(
          { _id: pose._id },
          { $set: { image_url: upload.secure_url } }
        );

        console.log(`   ✅ Attached: ${upload.secure_url}\n`);
        results.success.push({ file, pose: pose.name, url: upload.secure_url });

      } catch (err) {
        console.error(`   ❌ Failed for "${file}": ${err.message}\n`);
        results.failed.push({ file, error: err.message });
      }
    }
  }

  // ── Summary ───────────────────────────────────────────────────────────────
  console.log('\n══════════════════════════════════════');
  console.log('           UPLOAD SUMMARY');
  console.log('══════════════════════════════════════');
  console.log(`✅ Success  : ${results.success.length}`);
  console.log(`⚠️  Skipped  : ${results.skipped.length}`);
  console.log(`❌ Failed   : ${results.failed.length}`);

  if (results.skipped.length) {
    console.log('\nSkipped (no matching pose in DB or alias):');
    results.skipped.forEach(s => console.log(`  • ${s.file} — ${s.reason}`));
  }
  if (results.failed.length) {
    console.log('\nFailed uploads:');
    results.failed.forEach(f => console.log(`  • ${f.file} — ${f.error}`));
  }

  await mongoose.disconnect();
  console.log('\nDone. MongoDB disconnected.');
  process.exit(0);
}

uploadAndAttach().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
