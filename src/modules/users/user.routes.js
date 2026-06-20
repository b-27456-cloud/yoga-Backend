/**
 * User Routes
 * Mount path: /api/v1/users
 */

const express = require('express');
const userController = require('./user.controller');
const { verifyToken, requireRegistered } = require('../../middleware/auth');

const router = express.Router();

router.use(verifyToken, requireRegistered);
router.use('/:user_id', userController.checkOwnership);

router.get('/:user_id/profile', userController.getProfile);
router.put('/:user_id/profile', userController.updateProfile);

router.put('/:user_id/settings', userController.updateSettings);

router.delete('/:user_id', userController.deleteUser);

router.get('/:user_id/favorites', userController.getFavorites);
router.post('/:user_id/favorites', userController.addFavorite);
router.delete('/:user_id/favorites/:item_id', userController.removeFavorite);

module.exports = router;
