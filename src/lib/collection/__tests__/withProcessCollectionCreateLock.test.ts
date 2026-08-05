import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Address } from 'viem';

vi.mock('@/lib/redis/acquireLock', () => ({
  acquireLock: vi.fn(),
  releaseLock: vi.fn(),
}));

import { withProcessCollectionCreateLock } from '../withProcessCollectionCreateLock';
import { acquireLock, releaseLock } from '@/lib/redis/acquireLock';

const ARTIST = '0xAbC0000000000000000000000000000000dEaD' as Address;
const CHAIN_ID = 8453;
const LOCK = {
  key: `process-collection-create:${ARTIST.toLowerCase()}:${CHAIN_ID}`,
  token: 'tok',
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(acquireLock).mockResolvedValue(LOCK);
  vi.mocked(releaseLock).mockResolvedValue(undefined);
});

describe('withProcessCollectionCreateLock', () => {
  it('locks on lowercased artist and chainId and runs fn while holding it', async () => {
    const fn = vi.fn().mockResolvedValue('result');

    const result = await withProcessCollectionCreateLock(ARTIST, CHAIN_ID, fn);

    expect(acquireLock).toHaveBeenCalledWith(
      `process-collection-create:${ARTIST.toLowerCase()}:${CHAIN_ID}`,
      expect.any(Number),
      expect.any(Number)
    );
    expect(fn).toHaveBeenCalledTimes(1);
    expect(result).toBe('result');
    expect(releaseLock).toHaveBeenCalledWith(LOCK);
  });

  it('releases the lock even if fn throws', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('create failed'));

    await expect(
      withProcessCollectionCreateLock(ARTIST, CHAIN_ID, fn)
    ).rejects.toThrow('create failed');

    expect(releaseLock).toHaveBeenCalledWith(LOCK);
  });

  it('does not run fn if the lock could not be acquired', async () => {
    vi.mocked(acquireLock).mockRejectedValue(new Error('Timed out'));
    const fn = vi.fn();

    await expect(
      withProcessCollectionCreateLock(ARTIST, CHAIN_ID, fn)
    ).rejects.toThrow('Timed out');

    expect(fn).not.toHaveBeenCalled();
    expect(releaseLock).not.toHaveBeenCalled();
  });
});
