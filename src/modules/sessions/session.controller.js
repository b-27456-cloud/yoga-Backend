/**
 * Session Controller
 * Handles HTTP requests for yoga sessions.
 */

const sessionService = require('./session.service');

/**
 * Start a new session
 * POST /api/v1/sessions/start
 * Body: { pose_id, music_id (optional) }
 */
async function startSession(req, res, next) {
  try {
    const { pose_id, music_id } = req.body;
    
    const result = await sessionService.startSession({
      user_id: req.user.user_id,
      pose_id,
      music_id,
    });
    
    res.status(201).json({
      status: 'success',
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Log a frame to an active session
 * POST /api/v1/sessions/:id/log-frame
 * Body: { landmarks: [{ x, y, z, visibility }, ...] }
 */
async function logFrame(req, res, next) {
  try {
    const { landmarks } = req.body;
    
    const result = await sessionService.logFrame({
      session_id: req.params.id,
      user_id: req.user.user_id,
      landmarks,
    });
    
    res.status(200).json({
      status: 'success',
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * End a session
 * POST /api/v1/sessions/:id/end
 * Body: { notes (optional) }
 */
async function endSession(req, res, next) {
  try {
    const { notes } = req.body;
    
    const session = await sessionService.endSession({
      session_id: req.params.id,
      user_id: req.user.user_id,
      notes,
    });
    
    res.status(200).json({
      status: 'success',
      data: session,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Get user's session history
 * GET /api/v1/sessions/user/:user_id
 */
async function getUserHistory(req, res, next) {
  try {
    // Only allow users to view their own history (unless admin)
    if (req.user.user_id.toString() !== req.params.user_id && req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Forbidden: You can only view your own history',
      });
    }

    const { page, limit } = req.query;
    const result = await sessionService.getUserHistory(req.params.user_id, page, limit);
    
    res.status(200).json({
      status: 'success',
      ...result,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Get a specific session by ID
 * GET /api/v1/sessions/:id
 */
async function getSessionById(req, res, next) {
  try {
    const session = await sessionService.getSessionById(req.params.id, req.user.user_id);
    
    res.status(200).json({
      status: 'success',
      data: session,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  startSession,
  logFrame,
  endSession,
  getUserHistory,
  getSessionById,
};
