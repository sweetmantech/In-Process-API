import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Address } from 'viem';

vi.mock('@/lib/supabase/in_process_artists/selectArtists', () => ({
  default: vi.fn(),
}));

import selectArtists from '@/lib/supabase/in_process_artists/selectArtists';
import getArtistByTelegram from '../getArtistByTelegram';

const ARTIST_ADDRESS = '0xArtist' as Address;
const ARTIST = {
  id: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
  username: 'alice',
  wallets: [{ address: ARTIST_ADDRESS, type: 'external' }],
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('getArtistByTelegram', () => {
  it('resolves the merged artist for a known, wallet-linked telegram username', async () => {
    vi.mocked(selectArtists).mockResolvedValue({
      data: [ARTIST],
      error: null,
    } as never);

    const result = await getArtistByTelegram('testuser');

    expect(selectArtists).toHaveBeenCalledWith({ telegram: 'testuser' });
    expect(result).toEqual({
      artistId: ARTIST.id,
      username: ARTIST.username,
      primaryWallet: ARTIST_ADDRESS,
      wallets: [{ address: ARTIST_ADDRESS, type: 'external' }],
    });
  });

  it('resolves null for an unknown telegram username', async () => {
    vi.mocked(selectArtists).mockResolvedValue({
      data: [],
      error: null,
    } as never);

    const result = await getArtistByTelegram('unknownuser');

    expect(result).toBeNull();
  });

  it('resolves null when the artist has no wallet', async () => {
    vi.mocked(selectArtists).mockResolvedValue({
      data: [{ ...ARTIST, wallets: [] }],
      error: null,
    } as never);

    const result = await getArtistByTelegram('testuser');

    expect(result).toBeNull();
  });
});
