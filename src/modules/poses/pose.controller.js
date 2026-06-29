/**
 * Pose Controller
 * Handles HTTP requests for poses.
 */

const poseService = require('./pose.service');
const { checkProgressionAccess } = require('./pose.service');

/**
 * Get paginated list of poses
 * GET /api/v1/poses
 * Query Params: page, limit, difficulty, level, target_area
 */
async function getPoses(req, res, next) {
  try {
    const result = await poseService.getPoses(req.query);
    
    res.status(200).json({
      status: 'success',
      ...result,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Search poses
 * GET /api/v1/poses/search?query=...
 */
async function searchPoses(req, res, next) {
  try {
    const { query, page, limit } = req.query;
    
    // We reuse the getPoses service method by passing the search string
    const result = await poseService.getPoses({ search: query, page, limit });
    
    res.status(200).json({
      status: 'success',
      ...result,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Get pose by ID or Slug
 * GET /api/v1/poses/:idOrSlug
 */
async function getPose(req, res, next) {
  try {
    const pose = await poseService.getPoseByIdOrSlug(req.params.idOrSlug);

    // Enforce progression: intermediate/advanced poses are locked until all
    // beginner poses are completed. Admins bypass this restriction.
    if (req.user && req.user.user_id && req.user.role !== 'admin') {
      await checkProgressionAccess(req.user.user_id, pose);
    }
    
    res.status(200).json({
      status: 'success',
      data: pose,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Get poses by level
 * GET /api/v1/poses/level/:level
 */
async function getPosesByLevel(req, res, next) {
  try {
    const { level } = req.params;
    const { page, limit } = req.query;
    
    const result = await poseService.getPoses({ level, page, limit });
    
    res.status(200).json({
      status: 'success',
      ...result,
    });
  } catch (err) {
    next(err);
  }
}

// ---- Admin Endpoints ----

/**
 * Create a new pose
 * POST /api/v1/poses
 */
async function createPose(req, res, next) {
  try {
    const pose = await poseService.createPose(req.body);
    
    res.status(201).json({
      status: 'success',
      data: pose,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Update a pose
 * PUT /api/v1/poses/:id
 */
async function updatePose(req, res, next) {
  try {
    const pose = await poseService.updatePose(req.params.id, req.body);
    
    res.status(200).json({
      status: 'success',
      data: pose,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Delete a pose
 * DELETE /api/v1/poses/:id
 */
async function deletePose(req, res, next) {
  try {
    await poseService.deletePose(req.params.id);
    
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

const { evaluatePoseAccuracy } = require('../sessions/angle.calculator');

/**
 * Evaluate a single frame of landmarks against a pose
 * POST /api/v1/poses/:id/evaluate
 */
async function evaluatePose(req, res, next) {
  try {
    const { landmarks } = req.body;
    const pose = await poseService.getPoseByIdOrSlug(req.params.id);
    
    if (!pose || !pose.reference_angles) {
      return res.status(400).json({ status: 'error', message: 'Pose reference data unavailable' });
    }

    // Enforce progression gate (same rule as getPose)
    if (req.user && req.user.user_id && req.user.role !== 'admin') {
      await checkProgressionAccess(req.user.user_id, pose);
    }

    // Determine accessibility profile if user is authenticated
    let accessibilityProfile = 'standard';
    if (req.user && req.user.user_id) {
      const User = require('../auth/auth.model');
      const user = await User.findById(req.user.user_id).select('accessibility.profile');
      if (user && user.accessibility && user.accessibility.profile) {
        accessibilityProfile = user.accessibility.profile;
      }
    }

    const { overall_accuracy, feedback } = evaluatePoseAccuracy(landmarks, pose.reference_angles, accessibilityProfile);

    res.status(200).json({
      status: 'success',
      accuracy: overall_accuracy,
      feedback
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getPoses,
  searchPoses,
  getPose,
  getPosesByLevel,
  createPose,
  updatePose,
  deletePose,
  evaluatePose,
};
