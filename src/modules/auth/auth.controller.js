/**
 * Auth Controller
 * Handles HTTP requests for authentication.
 */

const authService = require('./auth.service');
const { AppError } = require('../../middleware/errorHandler');

/**
 * Register user
 * POST /api/v1/auth/register
 * Requires valid Firebase ID token in Authorization header.
 * req.user is populated by verifyToken middleware.
 */
async function register(req, res, next) {
  try {
    const { firebase_uid, email, email_verified } = req.user;
    
    // We expect Firebase to handle email verification, but we can still register them
    // and rely on client to enforce verification before allowing access to certain features.

    const userData = {
      firebase_uid,
      email,
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      phone: req.body.phone,
      age: req.body.age,
      accessibility_profile: req.body.accessibility_profile,
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
 * Requires valid Firebase ID token in Authorization header.
 */
async function login(req, res, next) {
  try {
    const { firebase_uid } = req.user;

    const user = await authService.findByFirebaseUid(firebase_uid);

    if (!user) {
      throw new AppError('User not registered. Please register first.', 404);
    }

    res.status(200).json({
      status: 'success',
      data: user,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Logout user
 * POST /api/v1/auth/logout
 * Client handles the actual Firebase signOut(). This is just to log the event
 * or clear any server-side state if needed in the future.
 */
async function logout(req, res, next) {
  try {
    // In Firebase auth, the token is technically still valid until it expires (~1 hr),
    // but the client has thrown it away. We could blacklist it, but typically
    // it's not strictly necessary for MVP unless immediate revocation is required.
    // For now, we just return success.
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
