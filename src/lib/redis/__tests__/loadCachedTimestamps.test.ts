import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../redisClient', () => ({
  default: { get: vi.fn(), set: vi.fn() },
}));
vi.mock('@/lib/consts', () => ({
  REDIS_TIMESTAMP_KEY: 'indexer:cached_timestamps',
}));
vi.mock('@/lib/indexer/indexers', () => ({
  indexers: [{ indexName: 'moments' }, { indexName: 'sales' }],
}));

import loadCachedTimestamps from '../loadCachedTimestamps';
import redisClient from '../redisClient';

const mockRedisGet = vi.mocked(redisClient.get);

describe('loadCachedTimestamps', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns null when redis has no cached value', async () => {
    mockRedisGet.mockResolvedValue(null);
    expect(await loadCachedTimestamps()).toBeNull();
  });

  it('returns parsed timestamps when all indexers are present', async () => {
    const stored = { moments: 1700000000, sales: null };
    mockRedisGet.mockResolvedValue(JSON.stringify(stored));

    const result = await loadCachedTimestamps();
    expect(result).toEqual(stored);
  });

  it('returns null when a new indexer is missing from cache', async () => {
    // Cache only has "moments" but indexers also has "sales"
    const stored = { moments: 1700000000 };
    mockRedisGet.mockResolvedValue(JSON.stringify(stored));

    expect(await loadCachedTimestamps()).toBeNull();
  });

  it('reads from the correct redis key', async () => {
    mockRedisGet.mockResolvedValue(null);
    await loadCachedTimestamps();
    expect(mockRedisGet).toHaveBeenCalledWith('indexer:cached_timestamps');
  });
});
