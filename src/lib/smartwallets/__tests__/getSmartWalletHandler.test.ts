import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/coinbase/getCanonicalSmartAccount', () => ({
  getCanonicalSmartAccount: vi.fn(),
}));

import { getCanonicalSmartAccount } from '@/lib/coinbase/getCanonicalSmartAccount';
import getSmartWalletHandler from '@/lib/smartwallets/getSmartWalletHandler';

const ARTIST_ID = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';
const SMART_ADDRESS = '0xabcdef123456789012345678901234567890abcd';

describe('getSmartWalletHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns smart wallet address lowercased', async () => {
    vi.mocked(getCanonicalSmartAccount).mockResolvedValue({
      address: SMART_ADDRESS,
    } as any);

    const res = await getSmartWalletHandler(ARTIST_ID);
    const json = await res.json();

    expect(json).toEqual({ address: SMART_ADDRESS });
    expect(getCanonicalSmartAccount).toHaveBeenCalledWith({
      artistId: ARTIST_ID,
    });
  });

  it('propagates when getCanonicalSmartAccount rejects', async () => {
    vi.mocked(getCanonicalSmartAccount).mockRejectedValue(
      new Error('CDP unavailable')
    );

    await expect(getSmartWalletHandler(ARTIST_ID)).rejects.toThrow(
      'CDP unavailable'
    );
  });
});
