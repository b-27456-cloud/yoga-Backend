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

const imageToPoseMapping = {
  'image2.png': 'Child’s Pose',
  'image3.png': 'Cat-Cow Pose',
  'image4.png': 'Cobra Pose',
  'image5.png': 'Bridge Pose',
  'image6.png': 'Tree Pose',
  'image7.png': 'Seated Forward Bend',
  'image8.png': 'Easy Pose',
  'image9.png': 'Warrior I',
  'image10.png': 'Warrior II',
  'image11.png': 'Triangle Pose'
};

const caloriesMapping = {
  'Child’s Pose': 3,
  'Cat-Cow Pose': 4,
  'Cobra Pose': 5,
  'Bridge Pose': 6,
  'Tree Pose': 5,
  'Seated Forward Bend': 4,
  'Easy Pose': 2,
  'Warrior I': 10,
  'Warrior II': 10,
  'Triangle Pose': 8,
  'Mountain Pose': 3,
  'Downward Facing Dog': 8,
  'Wheel Pose': 12,
  'Crow Pose': 15,
  'Headstand': 15
};

dotenv.config({ path: path.resolve(__dirname, '.env') });

async function uploadAndAttachImages() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    const assetsDir = path.join(__dirname, 'assets');
    const files = Object.keys(imageToPoseMapping);

    for (const file of files) {
      const poseName = imageToPoseMapping[file];
      const filePath = path.join(assetsDir, file);

      if (!fs.existsSync(filePath)) {
        console.log(`File not found: ${filePath}`);
        continue;
      }

      console.log(`Uploading ${file} for pose: ${poseName}...`);
      
      const uploadResult = await cloudinary.uploader.upload(filePath, {
        resource_type: "image",
        folder: "yogaflow_poses_images"
      });

      console.log(`Uploaded! URL: ${uploadResult.secure_url}`);

      // Update image_url
      const pose = await Pose.findOne({ name: poseName });
      if (pose) {
        pose.image_url = uploadResult.secure_url;
        await pose.save();
        console.log(`✅ Attached image to pose: ${poseName}`);
      } else {
        console.log(`❌ Pose '${poseName}' not found!`);
      }
    }

    // Now update calories for ALL poses
    console.log("\nUpdating calories for all poses...");
    const allPoses = await Pose.find({});
    for (const pose of allPoses) {
      const cals = caloriesMapping[pose.name] || 5;
      pose.expected_calories = cals;
      await pose.save();
      console.log(`✅ Set calories for ${pose.name} to ${cals}`);
    }

    console.log("\nAll images uploaded and calories updated successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error during process:", error);
    process.exit(1);
  }
}

uploadAndAttachImages();
