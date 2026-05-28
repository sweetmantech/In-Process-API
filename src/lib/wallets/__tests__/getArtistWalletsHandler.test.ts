import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/supabase/in_process_wallets/selectWallets', () => ({
  default: vi.fn(),
}));

import selectWallets from '@/lib/supabase/in_process_wallets/selectWallets';
import getArtistWalletsHandler from '@/lib/wallets/getArtistWalletsHandler';

const ARTIST_ID = '550e8400-e29b-41d4-a716-446655440000';

describe('getArtistWalletsHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns wallets for artist', async () => {
    vi.mocked(selectWallets).mockResolvedValue({
      data: [
        { address: '0xprivy', type: 'privy' },
        { address: '0xexternal', type: 'external' },
      ],
      error: null,
    } as any);

    const result = await getArtistWalletsHandler({ artistId: ARTIST_ID });

    expect(selectWallets).toHaveBeenCalledWith({ artistIds: [ARTIST_ID] });
    expect(result.wallets).toEqual([
      { address: '0xprivy', type: 'privy' },
      { address: '0xexternal', type: 'external' },
    ]);
  });

  it('throws when no wallets are found', async () => {
    vi.mocked(selectWallets).mockResolvedValue({
      data: [],
      error: null,
    } as any);

    await expect(
      getArtistWalletsHandler({ artistId: ARTIST_ID })
    ).rejects.toThrow('No wallets found for artist');
  });
});
