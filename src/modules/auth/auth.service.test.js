/**
 * Unit tests for Auth Service
 */

const authService = require('./auth.service');
const User = require('./auth.model');
const logger = require('../../middleware/logging');

// Mock dependencies
jest.mock('./auth.model');
jest.mock('../../middleware/logging');

describe('Auth Service', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('registerUser', () => {
    const mockUserData = {
      firebase_uid: 'test_uid_123',
      email: 'test@example.com',
      first_name: 'John',
      last_name: 'Doe',
      phone: '+1234567890',
      age: 25,
      accessibility_profile: 'standard',
    };

    it('should create a new user successfully', async () => {
      User.findOne.mockResolvedValue(null); // No existing user
      const mockCreatedUser = { _id: 'mongo_id_123', ...mockUserData };
      User.create.mockResolvedValue(mockCreatedUser);

      const result = await authService.registerUser(mockUserData);

      expect(User.findOne).toHaveBeenCalledWith({
        $or: [
          { firebase_uid: mockUserData.firebase_uid },
          { email: mockUserData.email },
        ],
      });
      expect(User.create).toHaveBeenCalledWith(expect.objectContaining({
        firebase_uid: 'test_uid_123',
        email: 'test@example.com',
        first_name: 'John',
      }));
      expect(result).toEqual(mockCreatedUser);
      expect(logger.info).toHaveBeenCalled();
    });

    it('should throw 409 conflict if user already exists', async () => {
      User.findOne.mockResolvedValue({ firebase_uid: 'test_uid_123' }); // Simulating existing user

      await expect(authService.registerUser(mockUserData)).rejects.toThrow('User already registered with this Firebase account');
      expect(User.create).not.toHaveBeenCalled();
    });
  });

  describe('findByFirebaseUid', () => {
    it('should return user if found', async () => {
      const mockUser = { firebase_uid: 'uid_123', email: 'test@example.com' };
      User.findOne.mockResolvedValue(mockUser);

      const result = await authService.findByFirebaseUid('uid_123');
      
      expect(User.findOne).toHaveBeenCalledWith({ firebase_uid: 'uid_123' });
      expect(result).toEqual(mockUser);
    });

    it('should return null if not found', async () => {
      User.findOne.mockResolvedValue(null);

      const result = await authService.findByFirebaseUid('not_found');
      
      expect(result).toBeNull();
    });
  });

  describe('updateProfile', () => {
    it('should update user profile successfully', async () => {
      const mockUpdatedUser = { _id: 'user_123', first_name: 'Jane' };
      User.findByIdAndUpdate.mockResolvedValue(mockUpdatedUser);

      const result = await authService.updateProfile('user_123', { first_name: 'Jane', accessibility: { theme: 'dark' } });

      expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
        'user_123',
        { $set: { first_name: 'Jane', 'accessibility.theme': 'dark' } },
        { new: true, runValidators: true }
      );
      expect(result).toEqual(mockUpdatedUser);
    });

    it('should throw 404 if user not found for update', async () => {
      User.findByIdAndUpdate.mockResolvedValue(null);

      await expect(authService.updateProfile('non_existent', { first_name: 'Jane' })).rejects.toThrow('User not found');
    });
  });
});
