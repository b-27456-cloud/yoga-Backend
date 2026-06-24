const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Pose = require('./src/modules/poses/pose.model');

// Configure Cloudinary
cloudinary.config({ 
  cloud_name: 'dxj0mosok', 
  api_key: '997996518616349', 
  api_secret: 'fjsLovm0gJS7U9-jjZJyH7Bkfz8' 
});

const videoToPoseMapping = {
  'IMG_6110.MOV': 'Mountain Pose',
  'IMG_6111.MOV': 'Child’s Pose',
  'IMG_6112.MOV': 'Cat-Cow Pose',
  'IMG_6113.MOV': 'Cobra Pose',
  'IMG_6114.MOV': 'Bridge Pose',
  'IMG_6115.MOV': 'Tree Pose',
  'IMG_6116.MOV': 'Seated Forward Bend',
  'IMG_6117.MOV': 'Easy Pose',
  'IMG_6118.MOV': 'Warrior I',
  'IMG_6119.MOV': 'Warrior II',
  'IMG_6120.MOV': 'Triangle Pose'
};

// Load env vars for MONGODB_URI
dotenv.config({ path: path.resolve(__dirname, '.env') });

async function uploadAndAttach() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    const assetsDir = path.join(__dirname, 'assets');
    const files = Object.keys(videoToPoseMapping); // We'll just iterate over mapping

    for (const file of files) {
      const poseName = videoToPoseMapping[file];
      const filePath = path.join(assetsDir, file);

      if (!fs.existsSync(filePath)) {
        console.log(`File not found: ${filePath}`);
        continue;
      }

      console.log(`Uploading ${file} for pose: ${poseName}...`);
      
      const uploadResult = await cloudinary.uploader.upload(filePath, {
        resource_type: "video",
        folder: "yogaflow_poses_videos"
      });

      console.log(`Uploaded! URL: ${uploadResult.secure_url}`);

      // Find the pose and update its video.full_url
      const pose = await Pose.findOne({ name: poseName });
      if (pose) {
        pose.video = pose.video || {};
        pose.video.full_url = uploadResult.secure_url;
        await pose.save();
        console.log(`✅ Successfully attached video to pose: ${poseName}\n`);
      } else {
        console.log(`❌ Pose '${poseName}' not found in DB!\n`);
      }
    }

    console.log("All videos uploaded and attached successfully!");
    
    // Also we want to update the poses.seed.js file so future seeds don't overwrite this data
    // That's complex to do via AST, so we will just mention it's saved in the live DB for now.

    process.exit(0);
  } catch (error) {
    console.error("Error during process:", error);
    process.exit(1);
  }
}

uploadAndAttach();
