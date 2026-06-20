/**
 * Unit tests for Music Service
 */

const musicService = require('./music.service');
const Music = require('./music.model');
const { getSignedUrl } = require('../../config/storage');

jest.mock('./music.model');
jest.mock('../../config/storage');
jest.mock('../../middleware/logging');

describe('Music Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getMusicList', () => {
    it('should query MongoDB with filters and return paginated results', async () => {
      const mockQuery = {
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue([{ title: 'Track 1' }]),
        sort: jest.fn().mockReturnThis(),
      };
      
      Music.find.mockReturnValue(mockQuery);
      Music.countDocuments.mockResolvedValue(1);

      const result = await musicService.getMusicList({ page: 1, limit: 10, genre: 'ambient', mood: 'calm' });

      expect(Music.find).toHaveBeenCalledWith({
        available: true,
        genre: 'ambient',
        mood: 'calm',
      });
      expect(result.tracks).toHaveLength(1);
      expect(result.meta.total).toBe(1);
    });
  });

  describe('recommendMusic', () => {
    it('should use MongoDB $sample aggregate to get random tracks', async () => {
      Music.aggregate.mockResolvedValue([{ title: 'Relaxing Vibes' }]);

      const result = await musicService.recommendMusic({ energy_level: 'low', limit: 3 });

      expect(Music.aggregate).toHaveBeenCalledWith([
        { $match: { available: true, 'yoga_suitability.energy_level': 'low' } },
        { $sample: { size: 3 } },
        { $project: expect.any(Object) }
      ]);
      expect(result[0].title).toBe('Relaxing Vibes');
    });
  });

  describe('getStreamUrl', () => {
    it('should return signed URL and increment play count', async () => {
      const mockTrack = {
        _id: 'music123',
        title: 'Zen',
        artist: 'Yogi',
        available: true,
        audio_file: { url: 'cloud_id_123' },
        metadata: { play_count: 5 },
        save: jest.fn().mockResolvedValue(true),
      };

      Music.findById.mockResolvedValue(mockTrack);
      getSignedUrl.mockReturnValue('https://signed.url/audio.mp4');

      const result = await musicService.getStreamUrl('music123');

      expect(getSignedUrl).toHaveBeenCalledWith('cloud_id_123', { resource_type: 'video' }, 7200);
      expect(mockTrack.metadata.play_count).toBe(6);
      expect(mockTrack.save).toHaveBeenCalled();
      expect(result.stream_url).toBe('https://signed.url/audio.mp4');
    });

    it('should throw 404 if track unavailable', async () => {
      Music.findById.mockResolvedValue({ available: false });

      await expect(musicService.getStreamUrl('123')).rejects.toThrow('Track not found or unavailable');
    });
  });
});
