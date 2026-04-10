import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../redisClient', () => ({
  default: { set: vi.fn(), get: vi.fn() },
}));
vi.mock('@/lib/consts', () => ({
  REDIS_TIMESTAMP_KEY: 'indexer:cached_timestamps',
}));

import saveCachedTimestamps from '../saveCachedTimestamps';
import redisClient from '../redisClient';

const mockRedisSet = vi.mocked(redisClient.set);

describe('saveCachedTimestamps', () => {
  beforeEach(() => vi.clearAllMocks());

  it('serializes timestamps to JSON and stores in redis', async () => {
    mockRedisSet.mockResolvedValue('OK');
    const timestamps = { moments: 1700000000, sales: null };

    await saveCachedTimestamps(timestamps);

    expect(mockRedisSet).toHaveBeenCalledWith(
      'indexer:cached_timestamps',
      JSON.stringify(timestamps)
    );
  });

  it('handles empty timestamps object', async () => {
    mockRedisSet.mockResolvedValue('OK');
    await saveCachedTimestamps({});
    expect(mockRedisSet).toHaveBeenCalledWith(
      'indexer:cached_timestamps',
      '{}'
    );
  });
});
