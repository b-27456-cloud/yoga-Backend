/**
 * User Controller
 */

const userService = require('./user.service');

function checkOwnership(req, res, next) {
  if (req.user.user_id.toString() !== req.params.user_id && req.user.role !== 'admin') {
    return res.status(403).json({
      status: 'error',
      message: 'Forbidden: You can only modify your own profile',
    });
  }
  next();
}

async function getProfile(req, res, next) {
  try {
    const profile = await userService.getProfile(req.params.user_id);
    res.status(200).json({ status: 'success', data: profile });
  } catch (err) {
    next(err);
  }
}

async function updateProfile(req, res, next) {
  try {
    const profile = await userService.updateProfile(req.params.user_id, req.body);
    res.status(200).json({ status: 'success', data: profile });
  } catch (err) {
    next(err);
  }
}

async function updateSettings(req, res, next) {
  try {
    const settings = await userService.updateSettings(req.params.user_id, req.body);
    res.status(200).json({ status: 'success', data: settings });
  } catch (err) {
    next(err);
  }
}

async function deleteUser(req, res, next) {
  try {
    await userService.softDeleteUser(req.params.user_id);
    res.status(200).json({ status: 'success', message: 'User deleted' });
  } catch (err) {
    next(err);
  }
}

async function addFavorite(req, res, next) {
  try {
    const { item_id, item_type } = req.body;
    const fav = await userService.addFavorite(req.params.user_id, item_id, item_type);
    res.status(201).json({ status: 'success', data: fav });
  } catch (err) {
    next(err);
  }
}

async function removeFavorite(req, res, next) {
  try {
    const result = await userService.removeFavorite(req.params.user_id, req.params.item_id);
    res.status(200).json({ status: 'success', data: result });
  } catch (err) {
    next(err);
  }
}

async function getFavorites(req, res, next) {
  try {
    const favs = await userService.getFavorites(req.params.user_id);
    res.status(200).json({ status: 'success', data: favs });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  checkOwnership,
  getProfile,
  updateProfile,
  updateSettings,
  deleteUser,
  addFavorite,
  removeFavorite,
  getFavorites,
};
