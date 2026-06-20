/**
 * Pose Routes
 * Mount path: /api/v1/poses
 */

const express = require('express');
const poseController = require('./pose.controller');
const { verifyToken, requireRegistered, requireAdmin } = require('../../middleware/auth');

const router = express.Router();

// Public / User routes
// We apply verifyToken and requireRegistered to ensure only logged-in users can view poses
router.use(verifyToken, requireRegistered);

router.get('/search', poseController.searchPoses);
router.get('/level/:level', poseController.getPosesByLevel);
router.get('/:idOrSlug', poseController.getPose);
router.get('/', poseController.getPoses);

// Admin routes
router.use(requireAdmin);

router.post('/', poseController.createPose);
router.put('/:id', poseController.updatePose);
router.delete('/:id', poseController.deletePose);

module.exports = router;
