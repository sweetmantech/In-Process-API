import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Address } from 'viem';

vi.mock('@/lib/redis/acquireLock', () => ({
  acquireLock: vi.fn(),
  releaseLock: vi.fn(),
}));

import { withSmartWalletMintLock } from '../withSmartWalletMintLock';
import { acquireLock, releaseLock } from '@/lib/redis/acquireLock';

const WALLET = '0xAbC0000000000000000000000000000000dEaD' as Address;
const LOCK = {
  key: `smart-wallet-mint-lock:${WALLET.toLowerCase()}`,
  token: 'tok',
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(acquireLock).mockResolvedValue(LOCK);
  vi.mocked(releaseLock).mockResolvedValue(undefined);
});

describe('withSmartWalletMintLock', () => {
  it('locks on the lowercased wallet address and runs fn while holding it', async () => {
    const fn = vi.fn().mockResolvedValue('result');

    const result = await withSmartWalletMintLock(WALLET, fn);

    expect(acquireLock).toHaveBeenCalledWith(
      `smart-wallet-mint-lock:${WALLET.toLowerCase()}`,
      expect.any(Number),
      expect.any(Number)
    );
    expect(fn).toHaveBeenCalledTimes(1);
    expect(result).toBe('result');
    expect(releaseLock).toHaveBeenCalledWith(LOCK);
  });

  it('releases the lock even if fn throws', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('mint failed'));

    await expect(withSmartWalletMintLock(WALLET, fn)).rejects.toThrow(
      'mint failed'
    );

    expect(releaseLock).toHaveBeenCalledWith(LOCK);
  });

  it('does not run fn if the lock could not be acquired', async () => {
    vi.mocked(acquireLock).mockRejectedValue(new Error('Timed out'));
    const fn = vi.fn();

    await expect(withSmartWalletMintLock(WALLET, fn)).rejects.toThrow(
      'Timed out'
    );

    expect(fn).not.toHaveBeenCalled();
    expect(releaseLock).not.toHaveBeenCalled();
  });
});
