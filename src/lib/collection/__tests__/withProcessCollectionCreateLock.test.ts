import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { Address } from 'viem';

vi.mock('@/lib/redis/acquireLock', () => ({
  acquireLock: vi.fn(),
  releaseLock: vi.fn(),
  renewLock: vi.fn(),
}));

import { withProcessCollectionCreateLock } from '../withProcessCollectionCreateLock';
import { acquireLock, releaseLock, renewLock } from '@/lib/redis/acquireLock';

const ARTIST = '0xAbC0000000000000000000000000000000dEaD' as Address;
const CHAIN_ID = 8453;
const LOCK = {
  key: `process-collection-create:${ARTIST.toLowerCase()}:${CHAIN_ID}`,
  token: 'tok',
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.useFakeTimers();
  vi.mocked(acquireLock).mockResolvedValue(LOCK);
  vi.mocked(releaseLock).mockResolvedValue(undefined);
  vi.mocked(renewLock).mockResolvedValue(true);
});

afterEach(() => {
  vi.useRealTimers();
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

  it('renews the lock while fn is running and clears renewal on release', async () => {
    let resolveFn!: (value: string) => void;
    const fn = vi.fn(
      () =>
        new Promise<string>((resolve) => {
          resolveFn = resolve;
        })
    );

    const pending = withProcessCollectionCreateLock(ARTIST, CHAIN_ID, fn);
    await Promise.resolve();
    await vi.advanceTimersByTimeAsync(30_000);
    await vi.advanceTimersByTimeAsync(30_000);

    expect(renewLock).toHaveBeenCalledTimes(2);
    expect(renewLock).toHaveBeenCalledWith(LOCK, expect.any(Number));

    resolveFn('done');
    await expect(pending).resolves.toBe('done');
    expect(releaseLock).toHaveBeenCalledWith(LOCK);

    vi.mocked(renewLock).mockClear();
    await vi.advanceTimersByTimeAsync(60_000);
    expect(renewLock).not.toHaveBeenCalled();
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
