/**
 * Auth Controller
 * Handles HTTP requests for authentication.
 */

const authService = require('./auth.service');
const { admin } = require('../../config/firebase');
const { config } = require('../../config/environment');
const { AppError } = require('../../middleware/errorHandler');

/**
 * Register user
 * POST /api/v1/auth/register
 * Accepts raw email and password. Uses Firebase Admin SDK to create the user,
 * then creates the MongoDB profile.
 */
async function register(req, res, next) {
  try {
    const { email, password, first_name, last_name, phone, age, accessibility_profile } = req.body;

    // 1. Create user in Firebase Auth
    let userRecord;
    try {
      userRecord = await admin.auth().createUser({
        email,
        password,
      });
    } catch (firebaseErr) {
      if (firebaseErr.code === 'auth/email-already-exists') {
        throw new AppError('Email is already in use by another account.', 409);
      }
      throw new AppError(`Firebase registration failed: ${firebaseErr.message}`, 400);
    }

    const firebase_uid = userRecord.uid;

    // 2. Create user in MongoDB
    const userData = {
      firebase_uid,
      email,
      first_name,
      last_name,
      phone,
      age,
      accessibility_profile,
    };

    const user = await authService.registerUser(userData);

    res.status(201).json({
      status: 'success',
      data: user,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Login user
 * POST /api/v1/auth/login
 * Uses Firebase Identity Toolkit REST API to authenticate via email/password.
 */
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!config.firebaseWebApi) {
      throw new AppError('FIREBASE_WEB_API_KEY is not configured on the server.', 500);
    }

    // 1. Authenticate with Firebase REST API
    const response = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${config.firebaseWebApi}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          returnSecureToken: true,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      const errMsg = data.error?.message || 'Authentication failed';
      if (errMsg === 'EMAIL_NOT_FOUND' || errMsg === 'INVALID_PASSWORD' || errMsg === 'INVALID_LOGIN_CREDENTIALS') {
        throw new AppError('Invalid email or password.', 401);
      }
      throw new AppError(`Firebase login failed: ${errMsg}`, 401);
    }

    const { idToken, localId: firebase_uid } = data;

    // 2. Fetch the MongoDB profile
    const user = await authService.findByFirebaseUid(firebase_uid);

    if (!user) {
      throw new AppError('User not registered. Please register first.', 404);
    }

    // 3. Return token and user profile
    res.status(200).json({
      status: 'success',
      token: idToken,
      data: user,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Logout user
 * POST /api/v1/auth/logout
 * Client handles discarding the token.
 */
async function logout(req, res, next) {
  try {
    res.status(200).json({
      status: 'success',
      message: 'Logged out successfully',
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Get current user profile
 * GET /api/v1/auth/me
 * Requires valid Firebase ID token and registered user in DB.
 */
async function me(req, res, next) {
  try {
    // req.user.mongoUser is populated by requireRegistered middleware
    res.status(200).json({
      status: 'success',
      data: req.user.mongoUser,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  register,
  login,
  logout,
  me,
};
