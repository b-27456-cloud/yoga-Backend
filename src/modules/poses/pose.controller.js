/**
 * Pose Controller
 * Handles HTTP requests for poses.
 */

const poseService = require('./pose.service');

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

module.exports = {
  getPoses,
  searchPoses,
  getPose,
  getPosesByLevel,
  createPose,
  updatePose,
  deletePose,
};
