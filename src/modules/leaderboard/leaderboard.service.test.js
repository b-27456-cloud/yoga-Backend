/**
 * Unit tests for Leaderboard Service
 */

const leaderboardService = require('./leaderboard.service');
const Streak = require('../streaks/streak.model');
const { cache } = require('../../config/cache');

jest.mock('../streaks/streak.model');
jest.mock('../../config/cache', () => ({
  getOrSet: jest.fn(async (key, fetcher) => fetcher()),
  cache: { get: jest.fn(), set: jest.fn() }
}));

describe('Leaderboard Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('computeLeaderboard', () => {
    it('should aggregate streaks and attach ranks', async () => {
      Streak.aggregate.mockResolvedValue([
        { user_id: 'userA', current_streak: 10, total_minutes_practiced: 100 },
        { user_id: 'userB', current_streak: 5, total_minutes_practiced: 50 },
      ]);

      const result = await leaderboardService.computeLeaderboard();

      expect(Streak.aggregate).toHaveBeenCalled();
      expect(cache.set).toHaveBeenCalledWith('global_leaderboard', result, 3600);
      expect(result[0].rank).toBe(1);
      expect(result[0].user_id).toBe('userA');
      expect(result[1].rank).toBe(2);
      expect(result[1].user_id).toBe('userB');
    });
  });
});
