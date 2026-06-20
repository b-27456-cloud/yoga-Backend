/**
 * Unit tests for Streak Service
 */

const streakService = require('./streak.service');
const Streak = require('./streak.model');
const DailyProgress = require('./dailyProgress.model');

jest.mock('./streak.model');
jest.mock('./dailyProgress.model');
jest.mock('../../middleware/logging');
jest.mock('../../services/fcm.service', () => ({
  sendNotification: jest.fn().mockResolvedValue(true)
}));

describe('Streak Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('updateUserStreak', () => {
    it('should initialize and increment streak for first session', async () => {
      const mockSession = {
        user_id: 'user123',
        duration_seconds: 600, // 10 mins
        accuracy_average: 85,
        end_time: new Date('2024-06-19T10:00:00Z'),
      };

      DailyProgress.findOne.mockResolvedValue(null);
      DailyProgress.create.mockResolvedValue({
        sessions_completed: 1,
        total_minutes: 10,
        average_accuracy: 85,
      });

      const mockStreak = {
        user_id: 'user123',
        current_streak: 0,
        longest_streak: 0,
        total_days_practiced: 0,
        total_minutes_practiced: 0,
        save: jest.fn().mockResolvedValue(true),
      };

      Streak.findOne.mockResolvedValue(mockStreak); // User already has a blank streak record

      await streakService.updateUserStreak(mockSession);

      expect(DailyProgress.create).toHaveBeenCalled();
      expect(mockStreak.current_streak).toBe(1);
      expect(mockStreak.total_days_practiced).toBe(1);
      expect(mockStreak.total_minutes_practiced).toBe(10);
      expect(mockStreak.longest_streak).toBe(1);
      expect(mockStreak.save).toHaveBeenCalled();
    });

    it('should increment streak if practiced the next day', async () => {
      const mockSession = {
        user_id: 'user123',
        duration_seconds: 600,
        accuracy_average: 90,
        end_time: new Date('2024-06-20T10:00:00Z'), // Next day
      };

      DailyProgress.findOne.mockResolvedValue(null);
      DailyProgress.create.mockResolvedValue({});

      const mockStreak = {
        user_id: 'user123',
        current_streak: 1,
        longest_streak: 1,
        last_session_date: new Date('2024-06-19T10:00:00Z'),
        total_days_practiced: 1,
        total_minutes_practiced: 10,
        save: jest.fn().mockResolvedValue(true),
      };

      Streak.findOne.mockResolvedValue(mockStreak);

      await streakService.updateUserStreak(mockSession);

      expect(mockStreak.current_streak).toBe(2);
      expect(mockStreak.longest_streak).toBe(2);
      expect(mockStreak.total_days_practiced).toBe(2);
      expect(mockStreak.total_minutes_practiced).toBe(20);
    });

    it('should not increment current_streak if practicing again on the same day', async () => {
      const mockSession = {
        user_id: 'user123',
        duration_seconds: 600,
        accuracy_average: 90,
        end_time: new Date('2024-06-19T15:00:00Z'), // Same day later
      };

      // Mock progress found (already practiced today)
      const mockProgress = {
        sessions_completed: 1,
        total_minutes: 10,
        average_accuracy: 85,
        save: jest.fn().mockResolvedValue(true),
      };
      DailyProgress.findOne.mockResolvedValue(mockProgress);

      const mockStreak = {
        user_id: 'user123',
        current_streak: 1,
        longest_streak: 1,
        last_session_date: new Date('2024-06-19T10:00:00Z'),
        total_days_practiced: 1,
        total_minutes_practiced: 10,
        save: jest.fn().mockResolvedValue(true),
      };

      Streak.findOne.mockResolvedValue(mockStreak);

      await streakService.updateUserStreak(mockSession);

      // Current streak shouldn't change
      expect(mockStreak.current_streak).toBe(1);
      expect(mockStreak.total_minutes_practiced).toBe(20);
      
      // Progress should update
      expect(mockProgress.sessions_completed).toBe(2);
      expect(mockProgress.total_minutes).toBe(20);
      expect(mockProgress.save).toHaveBeenCalled();
    });
  });

  describe('freezeStreak', () => {
    it('should consume a freeze and mark today as frozen', async () => {
      const mockStreak = {
        user_id: 'user123',
        current_streak: 5,
        available_freezes: 1,
        save: jest.fn().mockResolvedValue(true),
      };

      Streak.findOne.mockResolvedValue(mockStreak);
      DailyProgress.findOne.mockResolvedValue(null); // No progress today yet
      DailyProgress.create.mockResolvedValue(true);

      await streakService.freezeStreak('user123');

      expect(mockStreak.available_freezes).toBe(0);
      expect(mockStreak.save).toHaveBeenCalled();
      expect(DailyProgress.create).toHaveBeenCalledWith(
        expect.objectContaining({ is_frozen: true })
      );
    });

    it('should throw an error if no freezes available', async () => {
      Streak.findOne.mockResolvedValue({ available_freezes: 0 });

      await expect(streakService.freezeStreak('user123')).rejects.toThrow('No streak freezes available');
    });
  });
});
