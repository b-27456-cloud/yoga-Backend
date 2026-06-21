/**
 * Pose Routes
 * Mount path: /api/v1/poses
 */

/**
 * @swagger
 * tags:
 *   name: Poses
 *   description: Yoga pose management and retrieval endpoints
 */

const express = require('express');
const poseController = require('./pose.controller');
const { verifyToken, requireRegistered, requireAdmin } = require('../../middleware/auth');

const router = express.Router();

// Public / User routes
// We apply verifyToken and requireRegistered to ensure only logged-in users can view poses
router.use(verifyToken, requireRegistered);

/**
 * @swagger
 * /api/v1/poses/search:
 *   get:
 *     summary: Search poses
 *     tags: [Poses]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of matching poses
 */
router.get('/search', poseController.searchPoses);
/**
 * @swagger
 * /api/v1/poses/level/{level}:
 *   get:
 *     summary: Get poses by level
 *     tags: [Poses]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: level
 *         required: true
 *         schema:
 *           type: number
 *     responses:
 *       200:
 *         description: List of poses for the specified level
 */
router.get('/level/:level', poseController.getPosesByLevel);
/**
 * @swagger
 * /api/v1/poses/{id}/evaluate:
 *   post:
 *     summary: Evaluate pose
 *     tags: [Poses]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               landmarks:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/Landmark'
 *     responses:
 *       200:
 *         description: Pose evaluation results
 */
router.post('/:id/evaluate', poseController.evaluatePose);
/**
 * @swagger
 * /api/v1/poses/{idOrSlug}:
 *   get:
 *     summary: Get pose by ID or slug
 *     tags: [Poses]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: idOrSlug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Pose details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Pose'
 */
router.get('/:idOrSlug', poseController.getPose);
/**
 * @swagger
 * /api/v1/poses:
 *   get:
 *     summary: Get all poses
 *     tags: [Poses]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *       - in: query
 *         name: difficulty
 *         schema:
 *           type: string
 *       - in: query
 *         name: level
 *         schema:
 *           type: number
 *       - in: query
 *         name: target_area
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Paginated list of poses
 */
router.get('/', poseController.getPoses);

// Admin routes
router.use(requireAdmin);

/**
 * @swagger
 * /api/v1/poses:
 *   post:
 *     summary: Create a new pose (Admin only)
 *     tags: [Poses]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Pose'
 *     responses:
 *       201:
 *         description: Pose created
 */
router.post('/', poseController.createPose);

/**
 * @swagger
 * /api/v1/poses/{id}:
 *   put:
 *     summary: Update a pose (Admin only)
 *     tags: [Poses]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Pose'
 *     responses:
 *       200:
 *         description: Pose updated
 */
router.put('/:id', poseController.updatePose);

/**
 * @swagger
 * /api/v1/poses/{id}:
 *   delete:
 *     summary: Delete a pose (Admin only)
 *     tags: [Poses]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Pose deleted
 */
router.delete('/:id', poseController.deletePose);

module.exports = router;
