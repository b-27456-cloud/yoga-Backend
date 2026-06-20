/**
 * Unit tests for Pose Service
 */

const poseService = require('./pose.service');
const Pose = require('./pose.model');
const cacheModule = require('../../config/cache');

// Mock dependencies
jest.mock('./pose.model');
jest.mock('../../config/cache', () => ({
  getOrSet: jest.fn(async (key, fetcher) => fetcher()),
  invalidateByPrefix: jest.fn(),
  cache: {
    get: jest.fn(),
    set: jest.fn(),
  }
}));

describe('Pose Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getPoses', () => {
    it('should return paginated poses and meta', async () => {
      const mockPoses = [{ _id: '1', name: 'Downward Dog' }, { _id: '2', name: 'Child Pose' }];
      
      const mockQuery = {
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(mockPoses),
        sort: jest.fn().mockReturnThis(),
      };
      
      Pose.find.mockReturnValue(mockQuery);
      Pose.countDocuments.mockResolvedValue(2);

      const result = await poseService.getPoses({ page: 1, limit: 10 });

      expect(Pose.find).toHaveBeenCalledWith({ published: true });
      expect(result.poses).toEqual(mockPoses);
      expect(result.meta).toEqual({
        total: 2,
        page: 1,
        limit: 10,
        pages: 1,
      });
    });
  });

  describe('getPoseByIdOrSlug', () => {
    it('should find pose by slug', async () => {
      const mockPose = { _id: '1', slug: 'downward-dog' };
      Pose.findOne.mockReturnValue({ lean: jest.fn().mockResolvedValue(mockPose) });

      const result = await poseService.getPoseByIdOrSlug('downward-dog');

      expect(Pose.findOne).toHaveBeenCalledWith({ published: true, slug: 'downward-dog' });
      expect(result).toEqual(mockPose);
    });

    it('should find pose by ObjectId', async () => {
      const validObjectId = '507f1f77bcf86cd799439011';
      const mockPose = { _id: validObjectId };
      Pose.findOne.mockReturnValue({ lean: jest.fn().mockResolvedValue(mockPose) });

      const result = await poseService.getPoseByIdOrSlug(validObjectId);

      expect(Pose.findOne).toHaveBeenCalledWith({ published: true, _id: validObjectId });
      expect(result).toEqual(mockPose);
    });

    it('should throw 404 if not found', async () => {
      Pose.findOne.mockReturnValue({ lean: jest.fn().mockResolvedValue(null) });

      await expect(poseService.getPoseByIdOrSlug('non-existent')).rejects.toThrow('Pose not found');
    });
  });

  describe('createPose', () => {
    it('should create pose, generate slug, and invalidate cache', async () => {
      const poseData = { name: 'New Pose', difficulty: 'beginner' };
      const createdPose = { _id: '1', ...poseData, slug: 'new-pose' };
      
      Pose.create.mockResolvedValue(createdPose);

      const result = await poseService.createPose(poseData);

      expect(Pose.create).toHaveBeenCalledWith({ ...poseData, slug: 'new-pose' });
      expect(cacheModule.invalidateByPrefix).toHaveBeenCalledWith('poses_list_');
      expect(result).toEqual(createdPose);
    });
  });

  describe('updatePose', () => {
    it('should update pose and invalidate caches', async () => {
      const poseId = '507f1f77bcf86cd799439011';
      const updates = { name: 'Updated Pose' };
      const updatedPose = { _id: poseId, slug: 'updated-pose', name: 'Updated Pose' };
      
      Pose.findByIdAndUpdate.mockResolvedValue(updatedPose);

      const result = await poseService.updatePose(poseId, updates);

      expect(Pose.findByIdAndUpdate).toHaveBeenCalledWith(
        poseId,
        { name: 'Updated Pose', slug: 'updated-pose' },
        { new: true, runValidators: true }
      );
      expect(cacheModule.invalidateByPrefix).toHaveBeenCalledWith(`poses_detail_${poseId}`);
      expect(cacheModule.invalidateByPrefix).toHaveBeenCalledWith('poses_list_');
      expect(result).toEqual(updatedPose);
    });
  });
});
