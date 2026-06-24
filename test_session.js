const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');
const { startSession } = require('./src/modules/sessions/session.service');

dotenv.config({ path: path.resolve(__dirname, '.env') });

async function testStartSession() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // Mock user ID (since we only care if the pose_id resolution works)
    const mockUserId = new mongoose.Types.ObjectId();
    const poseSlugToTest = 'warrior-ii';

    console.log(`Starting session with pose slug: ${poseSlugToTest}...`);

    const result = await startSession({
      user_id: mockUserId,
      pose_id: poseSlugToTest, // Testing with slug!
    });

    console.log("\n✅ Success! Session created without CastError.");
    console.log("Session ID:", result.session._id);
    console.log("Resolved Pose ID:", result.session.pose_id);
    console.log("Reference Angles Included:", Object.keys(result.reference_angles || {}).length > 0);

    // Clean up the test session so it doesn't pollute the DB
    const Session = require('./src/modules/sessions/session.model');
    await Session.findByIdAndDelete(result.session._id);
    console.log("Test session cleaned up.");

    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error:", error.message);
    process.exit(1);
  }
}

testStartSession();
