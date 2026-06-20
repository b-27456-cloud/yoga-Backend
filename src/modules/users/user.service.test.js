/**
 * Unit tests for User Service
 */

const userService = require('./user.service');
const User = require('../auth/auth.model');
const Favorite = require('./favorite.model');

jest.mock('../auth/auth.model');
jest.mock('./favorite.model');

describe('User Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('updateProfile', () => {
    it('should strip sensitive fields before updating', async () => {
      User.findByIdAndUpdate.mockReturnValue({ lean: jest.fn().mockResolvedValue({ _id: '123' }) });

      await userService.updateProfile('123', {
        first_name: 'John',
        role: 'admin', // Should be stripped
        firebase_uid: 'hacked_uid' // Should be stripped
      });

      expect(User.findByIdAndUpdate).toHaveBeenCalledWith('123', { first_name: 'John' }, expect.any(Object));
    });
  });

  describe('softDeleteUser', () => {
    it('should obfuscate user data and set deleted flag', async () => {
      const mockUser = {
        firebase_uid: 'real_uid',
        first_name: 'John',
        last_name: 'Doe',
        save: jest.fn().mockResolvedValue(true)
      };

      User.findById.mockResolvedValue(mockUser);

      await userService.softDeleteUser('123');

      expect(mockUser.deleted).toBe(true);
      expect(mockUser.first_name).toBe('Deleted');
      expect(mockUser.firebase_uid).toBe('deleted_real_uid');
      expect(mockUser.save).toHaveBeenCalled();
    });
  });

  describe('addFavorite', () => {
    it('should create a favorite entry', async () => {
      Favorite.create.mockResolvedValue({ _id: 'fav123' });

      const res = await userService.addFavorite('user123', 'item123', 'Pose');

      expect(Favorite.create).toHaveBeenCalledWith({ user_id: 'user123', item_id: 'item123', item_type: 'Pose' });
      expect(res._id).toBe('fav123');
    });

    it('should catch duplicate key errors and return friendly message', async () => {
      const err = new Error('Duplicate');
      err.code = 11000;
      Favorite.create.mockRejectedValue(err);

      const res = await userService.addFavorite('user123', 'item123', 'Pose');

      expect(res.message).toBe('Already in favorites');
    });
  });
});
