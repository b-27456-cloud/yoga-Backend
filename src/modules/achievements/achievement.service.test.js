/**
 * Unit tests for Achievement Service
 */

const achievementService = require('./achievement.service');
const Achievement = require('./achievement.model');
const UserAchievement = require('./userAchievement.model');
const { getOrCreateStreak } = require('../streaks/streak.service');

jest.mock('./achievement.model');
jest.mock('./userAchievement.model');
jest.mock('../streaks/streak.service');
jest.mock('../../middleware/logging');
jest.mock('../../services/fcm.service', () => ({
  sendNotification: jest.fn().mockResolvedValue(true)
}));
jest.mock('../../config/cache', () => ({
  getOrSet: jest.fn(async (key, fetcher) => fetcher()),
  invalidateByPrefix: jest.fn(),
}));

describe('Achievement Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('evaluateBadges', () => {
    it('should award new badges if conditions are met', async () => {
      // Mock user streak (e.g. 7 day streak, 10 days total)
      getOrCreateStreak.mockResolvedValue({
        current_streak: 7,
        total_days_practiced: 10,
        total_minutes_practiced: 300,
      });

      // Mock catalog
      const mockCatalog = [
        { _id: 'badge1', slug: '7-day-streak', condition: { type: 'streak_days', value: 7 }, points_reward: 50 },
        { _id: 'badge2', slug: '10-sessions', condition: { type: 'total_sessions', value: 10 }, points_reward: 100 },
        { _id: 'badge3', slug: '30-day-streak', condition: { type: 'streak_days', value: 30 }, points_reward: 500 }, // Not met
      ];
      Achievement.find.mockReturnValue({ sort: jest.fn().mockReturnThis(), lean: jest.fn().mockResolvedValue(mockCatalog) });

      // Mock already earned
      // User has badge1 already, but not badge2
      UserAchievement.find.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue([{ achievement_id: 'badge1' }])
      });

      UserAchievement.insertMany.mockResolvedValue(true);

      await achievementService.evaluateBadges('user123');

      // It should only award badge2 because badge1 is already earned, and badge3 condition is not met
      expect(UserAchievement.insertMany).toHaveBeenCalledWith([{
        user_id: 'user123',
        achievement_id: 'badge2',
        points_earned: 100,
      }]);
    });

    it('should do nothing if no new badges are earned', async () => {
      getOrCreateStreak.mockResolvedValue({ current_streak: 1, total_days_practiced: 1 });
      const mockCatalog = [
        { _id: 'badge1', slug: '7-day-streak', condition: { type: 'streak_days', value: 7 } },
      ];
      Achievement.find.mockReturnValue({ sort: jest.fn().mockReturnThis(), lean: jest.fn().mockResolvedValue(mockCatalog) });
      UserAchievement.find.mockReturnValue({ select: jest.fn().mockReturnThis(), lean: jest.fn().mockResolvedValue([]) });

      UserAchievement.insertMany.mockReset();

      await achievementService.evaluateBadges('user123');

      expect(UserAchievement.insertMany).not.toHaveBeenCalled();
    });
  });
});
