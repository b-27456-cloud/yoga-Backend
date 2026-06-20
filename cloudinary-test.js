const cloudinary = require('cloudinary').v2;

// 1. Configure Cloudinary
// (Using inline configuration as per the onboarding flow instructions)
cloudinary.config({ 
  cloud_name: 'dxj0mosok', 
  api_key: '997996518616349', 
  api_secret: 'fjsLovm0gJS7U9-jjZJyH7Bkfz8' 
});

async function runCloudinaryTest() {
  try {
    // 2. Upload an image
    console.log("Uploading sample image...");
    const uploadResult = await cloudinary.uploader.upload(
      "https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg",
      { public_id: "onboarding_sample" }
    );
    console.log("\n--- Upload Successful ---");
    console.log("Secure URL:", uploadResult.secure_url);
    console.log("Public ID:", uploadResult.public_id);

    // 3. Get image details
    console.log("\n--- Image Details ---");
    console.log("Width:", uploadResult.width);
    console.log("Height:", uploadResult.height);
    console.log("Format:", uploadResult.format);
    console.log("Size (bytes):", uploadResult.bytes);

    // 4. Transform the image
    // f_auto: Automatically formats the image to the most efficient format for the browser
    // q_auto: Automatically adjusts the image quality to reduce file size without visible degradation
    const transformedUrl = cloudinary.url(uploadResult.public_id, {
      fetch_format: 'auto',
      quality: 'auto'
    });

    console.log("\n--- Transformation Complete ---");
    console.log("Done! Click link below to see optimized version of the image. Check the size and the format.");
    console.log(transformedUrl);

  } catch (error) {
    console.error("Error during Cloudinary test:", error);
  }
}

runCloudinaryTest();
