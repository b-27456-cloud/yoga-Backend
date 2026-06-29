/**
 * Firebase Auth Middleware
 * Verifies Firebase ID tokens on every authenticated request.
 * Sets `req.user` with { firebase_uid, email, mongoUser } for downstream handlers.
 */

const { admin, isFirebaseReady } = require('../config/firebase');
const User = require('../modules/auth/auth.model');
const { AppError } = require('./errorHandler');
const logger = require('./logging');

/**
 * Verify Firebase ID token and attach user to request.
 * Usage: router.get('/protected', verifyToken, controller.handler)
 */
async function verifyToken(req, res, next) {
  try {
    // 1. Extract token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('No authentication token provided. Send Firebase ID token in Authorization: Bearer <token>', 401);
    }

    const idToken = authHeader.replace('Bearer ', '');

    // 2. Check if Firebase is initialized
    if (!isFirebaseReady()) {
      throw new AppError('Authentication service is not configured', 503);
    }

    // 3. Verify the Firebase ID token
    const decoded = await admin.auth().verifyIdToken(idToken);

    // 4. Attach Firebase user info to request
    req.user = {
      firebase_uid: decoded.uid,
      email: decoded.email,
      email_verified: decoded.email_verified || false,
    };

    // 5. Optionally load the full MongoDB user (for routes that need it)
    const mongoUser = await User.findOne({ firebase_uid: decoded.uid });
    if (mongoUser) {
      req.user.mongoUser = mongoUser;
      req.user.user_id = mongoUser._id;
      req.user.role = mongoUser.role;
    }

    next();
  } catch (err) {
    // Handle specific Firebase auth errors with user-friendly language
    if (err.code === 'auth/id-token-expired') {
      return next(new AppError('Your session has expired. Please log in again.', 401));
    }
    if (err.code === 'auth/id-token-revoked') {
      return next(new AppError('Your access has been revoked. Please log in again.', 401));
    }
    if (err.code === 'auth/argument-error' || err.code === 'auth/invalid-id-token') {
      return next(new AppError('Your session is invalid. Please log in again.', 401));
    }

    // Pass through AppErrors (like 401/503 from above)
    if (err.isOperational) {
      return next(err);
    }

    logger.error('Auth middleware error:', { error: err.message });
    return next(new AppError('Authentication failed. Please log in again.', 401));
  }
}

/**
 * Require the user to exist in MongoDB (i.e., they must have registered).
 * Use after verifyToken for endpoints that need a fully registered user.
 */
function requireRegistered(req, res, next) {
  if (!req.user.mongoUser) {
    return next(new AppError('User not registered. Please register first via POST /api/v1/auth/register.', 403));
  }
  next();
}

/**
 * Require admin role.
 * Use after verifyToken + requireRegistered.
 */
function requireAdmin(req, res, next) {
  if (req.user.role !== 'admin') {
    return next(new AppError('Admin access required.', 403));
  }
  next();
}

module.exports = { verifyToken, requireRegistered, requireAdmin };
