# 🧘 YogaFlow Backend

The official backend API for the YogaFlow AI-powered yoga instruction platform.

## 🚀 Features
- **Firebase Authentication**: Secure JWT-based auth handling with Firebase Admin.
- **AI Pose Recognition**: Session endpoints accepting MediaPipe landmark frames to evaluate form accuracy.
- **Gamification Engine**: Daily streaks, custom freezes, and an automated background badge evaluator.
- **Audio Streaming**: Secure, expiring Cloudinary signed URLs for streaming 500+ yoga tracks.
- **Leaderboards**: Global top 100 ranking cached and refreshed hourly.
- **Real-Time Notifications**: Firebase Cloud Messaging (FCM) integration for milestones and badges.
- **Analytics**: Intelligent daily/weekly progress rollups and personalized insights.

## 🛠 Tech Stack
- **Node.js + Express.js**: High-performance REST API.
- **MongoDB + Mongoose**: Flexible, schema-driven data modeling with heavy aggregation pipelines.
- **Node-Cron & Node-Cache**: Memory-safe background tasks and instantaneous cache pre-loading.
- **Sentry**: Application monitoring and profiling.
- **Swagger**: Comprehensive interactive API documentation.

## 💻 Local Setup

1. **Clone the repository**
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Environment Variables**:
   Create a `.env` file in the root directory:
   ```env
   NODE_ENV=development
   PORT=8000
   MONGODB_URI=your_mongodb_connection_string
   CLOUDINARY_URL=your_cloudinary_url
   CORS_ORIGIN=http://localhost:3000
   FIREBASE_SERVICE_ACCOUNT={"type":"service_account",...}
   SENTRY_DSN=your_sentry_dsn
   ```
4. **Seed the Database**:
   ```bash
   npm run seed
   ```
5. **Start the Server**:
   ```bash
   npm run dev
   ```

## 📚 API Documentation
Once the server is running, visit the interactive Swagger documentation:
👉 `http://localhost:8000/api-docs`

## 🧪 Testing
The test suite utilizes Jest with high coverage across core services.
```bash
npm test
```

## 🔒 Security
- **Helmet**: Secures HTTP headers.
- **Express-Mongo-Sanitize**: Protects against NoSQL query injection.
- **Rate Limiting**: Throttles brute-force attacks globally.
- **Payload Limits**: Strict 10MB JSON and 1MB URL-encoded payload limits.

## ☁️ Deployment (Render)
The platform is fully configured for deployment on Render.
1. Connect the GitHub repository to a new Render Web Service.
2. Select **Node** environment.
3. Build Command: `npm install`
4. Start Command: `node src/server.js`
5. Map your `.env` variables into the Render Dashboard.
