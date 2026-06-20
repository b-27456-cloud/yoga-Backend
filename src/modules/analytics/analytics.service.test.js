/**
 * Unit tests for Analytics Service
 */

const analyticsService = require('./analytics.service');
const DailyProgress = require('../streaks/dailyProgress.model');
const Session = require('../sessions/session.model');
const { getOrCreateStreak } = require('../streaks/streak.service');

jest.mock('../streaks/dailyProgress.model');
jest.mock('../sessions/session.model');
jest.mock('../streaks/streak.service');
jest.mock('../../middleware/logging');
jest.mock('../../config/cache', () => ({
  getOrSet: jest.fn(async (key, fetcher) => fetcher()),
  invalidateByPrefix: jest.fn(),
  cache: { get: jest.fn(), set: jest.fn() }
}));

describe('Analytics Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getDailyStats', () => {
    it('should return daily progress if exists', async () => {
      const mockProgress = { date_string: '2024-06-19', sessions_completed: 2 };
      DailyProgress.findOne.mockReturnValue({ lean: jest.fn().mockResolvedValue(mockProgress) });

      const result = await analyticsService.getDailyStats('user123', '2024-06-19');

      expect(DailyProgress.findOne).toHaveBeenCalledWith({ user_id: 'user123', date_string: '2024-06-19' });
      expect(result).toEqual(mockProgress);
    });

    it('should return empty template if no progress exists', async () => {
      DailyProgress.findOne.mockReturnValue({ lean: jest.fn().mockResolvedValue(null) });

      const result = await analyticsService.getDailyStats('user123', '2024-06-19');

      expect(result.sessions_completed).toBe(0);
      expect(result.date_string).toBe('2024-06-19');
    });
  });

  describe('getWeeklyStats', () => {
    it('should aggregate 7 days of data correctly', async () => {
      const mockList = [
        { date_string: '2024-06-19', total_minutes: 10, sessions_completed: 1, average_accuracy: 90 },
        { date_string: '2024-06-20', total_minutes: 20, sessions_completed: 2, average_accuracy: 80 },
      ];
      DailyProgress.find.mockReturnValue({ sort: jest.fn().mockReturnThis(), lean: jest.fn().mockResolvedValue(mockList) });

      const result = await analyticsService.getWeeklyStats('user123', '2024-06-19');

      expect(DailyProgress.find).toHaveBeenCalledWith({
        user_id: 'user123',
        date_string: { $gte: '2024-06-19', $lte: '2024-06-25' }
      });
      expect(result.total_minutes).toBe(30);
      expect(result.total_sessions).toBe(3);
      // ((90*1) + (80*2)) / 3 = 250 / 3 = 83.333
      expect(result.average_accuracy).toBe(83);
    });
  });

  describe('getInsights', () => {
    it('should generate fire insight for >7 day streak', async () => {
      getOrCreateStreak.mockResolvedValue({ current_streak: 8, total_minutes_practiced: 100 });
      Session.findOne.mockReturnValue({ sort: jest.fn().mockReturnThis(), lean: jest.fn().mockResolvedValue(null) });

      const insights = await analyticsService.getInsights('user123');

      expect(insights).toContain("You're on fire! 🔥 A 8-day streak shows amazing dedication.");
    });

    it('should generate welcome back insight for broken streak', async () => {
      getOrCreateStreak.mockResolvedValue({ current_streak: 0, longest_streak: 5, total_minutes_practiced: 10 });
      Session.findOne.mockReturnValue({ sort: jest.fn().mockReturnThis(), lean: jest.fn().mockResolvedValue(null) });

      const insights = await analyticsService.getInsights('user123');

      expect(insights).toContain("Welcome back! Let's build a new streak today.");
    });
  });
});
