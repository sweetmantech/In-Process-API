import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/smartwallets/getSmartWalletAddress', () => ({
  default: vi.fn(),
}));

import getSmartWalletAddress from '@/lib/smartwallets/getSmartWalletAddress';
import getSmartWalletHandler from '@/lib/smartwallets/getSmartWalletHandler';

const VALID_WALLET = '0x1234567890123456789012345678901234567890' as const;

describe('getSmartWalletHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns smart wallet address lowercased', async () => {
    vi.mocked(getSmartWalletAddress).mockResolvedValue(
      '0xabcdef123456789012345678901234567890abcd' as never
    );

    const res = await getSmartWalletHandler(VALID_WALLET);
    const json = await res.json();

    expect(json).toEqual({
      address: '0xabcdef123456789012345678901234567890abcd',
    });
    expect(getSmartWalletAddress).toHaveBeenCalledWith(VALID_WALLET);
  });

  it('propagates when getSmartWalletAddress rejects', async () => {
    vi.mocked(getSmartWalletAddress).mockRejectedValue(
      new Error('CDP unavailable')
    );

    await expect(getSmartWalletHandler(VALID_WALLET)).rejects.toThrow(
      'CDP unavailable'
    );
  });
});
