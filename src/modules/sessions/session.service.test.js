/**
 * Unit tests for Session Service
 */

const sessionService = require('./session.service');
const Session = require('./session.model');
const Pose = require('../poses/pose.model');
const { evaluatePoseAccuracy } = require('./angle.calculator');
const { getSignedUrl } = require('../../config/storage');

// Mock dependencies
jest.mock('./session.model');
jest.mock('../poses/pose.model');
jest.mock('../../config/storage');
jest.mock('./angle.calculator');
jest.mock('../../middleware/logging');

// Provide a mock for Sentry to prevent ReferenceErrors if it's not installed
jest.mock('@sentry/node', () => ({
  captureException: jest.fn(),
}), { virtual: true });

describe('Session Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('startSession', () => {
    it('should create a session and return signed video URL if pose has video', async () => {
      Pose.findById.mockReturnValue({
        lean: jest.fn().mockResolvedValue({
          _id: 'pose123',
          video: { full_url: 'cloudinary_id' },
          reference_angles: { hip: { angle: 90 } },
        }),
      });

      Session.create.mockResolvedValue({ _id: 'session123', user_id: 'user123' });
      getSignedUrl.mockReturnValue('https://signed.url/video.mp4');

      const result = await sessionService.startSession({ user_id: 'user123', pose_id: 'pose123' });

      expect(Pose.findById).toHaveBeenCalledWith('pose123');
      expect(Session.create).toHaveBeenCalledWith(expect.objectContaining({
        user_id: 'user123',
        pose_id: 'pose123',
      }));
      expect(getSignedUrl).toHaveBeenCalledWith('cloudinary_id', { resource_type: 'video' }, 7200);
      expect(result.videoUrl).toBe('https://signed.url/video.mp4');
      expect(result.session._id).toBe('session123');
    });

    it('should throw 404 if pose not found', async () => {
      Pose.findById.mockReturnValue({ lean: jest.fn().mockResolvedValue(null) });

      await expect(sessionService.startSession({ user_id: 'user123', pose_id: 'invalid' }))
        .rejects.toThrow('Pose not found');
    });
  });

  describe('logFrame', () => {
    it('should calculate accuracy and push frame to session', async () => {
      Session.findOne.mockResolvedValue({
        _id: 'session123',
        pose_id: 'pose123',
        completed: false,
      });

      Pose.findById.mockReturnValue({
        lean: jest.fn().mockResolvedValue({
          reference_angles: { hip: { angle: 90 } },
        }),
      });

      evaluatePoseAccuracy.mockReturnValue({
        overall_accuracy: 85,
        calculated_angles: { hip: 88 },
        feedback: ['Adjust slightly'],
      });

      Session.updateOne.mockResolvedValue({});

      const result = await sessionService.logFrame({
        session_id: 'session123',
        user_id: 'user123',
        landmarks: [{ x: 1, y: 1, z: 1 }],
      });

      expect(evaluatePoseAccuracy).toHaveBeenCalled();
      expect(Session.updateOne).toHaveBeenCalledWith(
        { _id: 'session123' },
        expect.objectContaining({
          $push: expect.any(Object),
        })
      );
      expect(result.accuracy).toBe(85);
      expect(result.feedback).toEqual(['Adjust slightly']);
    });

    it('should throw 400 if session is already completed', async () => {
      Session.findOne.mockResolvedValue({
        completed: true,
      });

      await expect(sessionService.logFrame({ session_id: '1', user_id: '2', landmarks: [] }))
        .rejects.toThrow('Cannot log frame to a completed session');
    });
  });

  describe('endSession', () => {
    it('should mark session as completed, calculate duration/accuracy, and trigger tasks', async () => {
      const mockSession = {
        _id: 'session123',
        user_id: 'user123',
        start_time: new Date(Date.now() - 60000), // 60s ago
        accuracy_timeline: [80, 90, 100],
        completed: false,
        save: jest.fn().mockResolvedValue(true),
      };

      Session.findOne.mockResolvedValue(mockSession);

      const result = await sessionService.endSession({
        session_id: 'session123',
        user_id: 'user123',
        notes: 'Felt good',
      });

      expect(mockSession.completed).toBe(true);
      expect(mockSession.duration_seconds).toBeCloseTo(60, -1);
      expect(mockSession.accuracy_average).toBe(90); // (80+90+100)/3
      expect(mockSession.notes).toBe('Felt good');
      expect(mockSession.save).toHaveBeenCalled();
      expect(result).toBe(mockSession);
    });
  });
});
