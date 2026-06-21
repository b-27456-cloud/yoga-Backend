/**
 * User Routes
 * Mount path: /api/v1/users
 */

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User profile and settings management endpoints
 */

const express = require('express');
const userController = require('./user.controller');
const playlistController = require('../music/playlist.controller');
const { verifyToken, requireRegistered } = require('../../middleware/auth');

const router = express.Router();

router.use(verifyToken, requireRegistered);
router.use('/:user_id', userController.checkOwnership);

/**
 * @swagger
 * /api/v1/users/{user_id}/playlists:
 *   get:
 *     summary: Get user playlists
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of user playlists
 */
router.get('/:user_id/playlists', playlistController.getUserPlaylists);

/**
 * @swagger
 * /api/v1/users/{user_id}/profile:
 *   get:
 *     summary: Get user profile
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User profile
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/User'
 */
router.get('/:user_id/profile', userController.getProfile);

/**
 * @swagger
 * /api/v1/users/{user_id}/profile:
 *   put:
 *     summary: Update user profile
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: user_id
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
 *               first_name:
 *                 type: string
 *               last_name:
 *                 type: string
 *               phone:
 *                 type: string
 *               age:
 *                 type: number
 *               profile_photo_url:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully
 */
router.put('/:user_id/profile', userController.updateProfile);

/**
 * @swagger
 * /api/v1/users/{user_id}/settings:
 *   put:
 *     summary: Update user settings
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: user_id
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
 *               accessibility:
 *                 type: object
 *                 properties:
 *                   profile:
 *                     type: string
 *                   font_size:
 *                     type: string
 *                   theme:
 *                     type: string
 *                   voice_guidance:
 *                     type: boolean
 *                   haptic_feedback:
 *                     type: boolean
 *               settings:
 *                 type: object
 *                 properties:
 *                   language:
 *                     type: string
 *                   notifications:
 *                     type: object
 *                     properties:
 *                       daily_reminder:
 *                         type: boolean
 *                       streak_alerts:
 *                         type: boolean
 *                       achievement_alerts:
 *                         type: boolean
 *               privacy:
 *                 type: object
 *                 properties:
 *                   show_on_leaderboard:
 *                     type: boolean
 *     responses:
 *       200:
 *         description: Settings updated successfully
 */
router.put('/:user_id/settings', userController.updateSettings);

/**
 * @swagger
 * /api/v1/users/{user_id}:
 *   delete:
 *     summary: Soft delete user
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User deleted
 */
router.delete('/:user_id', userController.deleteUser);

/**
 * @swagger
 * /api/v1/users/{user_id}/favorites:
 *   get:
 *     summary: Get user favorites
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of favorites
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       favorite_id:
 *                         type: string
 *                       item_id:
 *                         type: string
 *                       item_type:
 *                         type: string
 *                       created_at:
 *                         type: string
 *                         format: date-time
 */
router.get('/:user_id/favorites', userController.getFavorites);

/**
 * @swagger
 * /api/v1/users/{user_id}/favorites:
 *   post:
 *     summary: Add an item to user favorites
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - item_id
 *               - item_type
 *             properties:
 *               item_id:
 *                 type: string
 *               item_type:
 *                 type: string
 *     responses:
 *       201:
 *         description: Favorite created
 */
router.post('/:user_id/favorites', userController.addFavorite);

/**
 * @swagger
 * /api/v1/users/{user_id}/favorites/{item_id}:
 *   delete:
 *     summary: Remove an item from user favorites
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: item_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Favorite removed
 */
router.delete('/:user_id/favorites/:item_id', userController.removeFavorite);

module.exports = router;
