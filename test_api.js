const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');
const Pose = require('./src/modules/poses/pose.model');

dotenv.config({ path: path.resolve(__dirname, '.env') });

async function testApi() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // Fetch the first pose from the DB
    const pose = await Pose.findOne({ name: 'Downward Facing Dog' });
    
    if (pose) {
      console.log("\n✅ Success! Here is the JSON representation of the pose as it will be returned by the API:\n");
      // Use the model's toJSON transform
      console.log(JSON.stringify(pose.toJSON(), null, 2));
    } else {
      console.log("Pose not found.");
    }

    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

testApi();
