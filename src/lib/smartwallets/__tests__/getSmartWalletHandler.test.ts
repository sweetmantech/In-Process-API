import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/coinbase/getOrCreateSmartWallet', () => ({
  getOrCreateSmartWallet: vi.fn(),
}));

import { getOrCreateSmartWallet } from '@/lib/coinbase/getOrCreateSmartWallet';
import getSmartWalletHandler from '@/lib/smartwallets/getSmartWalletHandler';

const VALID_WALLET = '0x1234567890123456789012345678901234567890' as const;

describe('getSmartWalletHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns smart wallet address lowercased', async () => {
    vi.mocked(getOrCreateSmartWallet).mockResolvedValue({
      address: '0xABCDEF123456789012345678901234567890abcd',
    } as never);

    const res = await getSmartWalletHandler(VALID_WALLET);
    const json = await res.json();

    expect(json).toEqual({
      address: '0xabcdef123456789012345678901234567890abcd',
    });
    expect(getOrCreateSmartWallet).toHaveBeenCalledWith({
      address: VALID_WALLET,
    });
  });

  it('propagates when getOrCreateSmartWallet rejects', async () => {
    vi.mocked(getOrCreateSmartWallet).mockRejectedValue(
      new Error('CDP unavailable')
    );

    await expect(getSmartWalletHandler(VALID_WALLET)).rejects.toThrow(
      'CDP unavailable'
    );
  });
});
