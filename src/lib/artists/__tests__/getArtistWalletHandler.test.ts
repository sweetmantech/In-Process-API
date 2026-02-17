import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock(
  '@/lib/supabase/in_process_artist_social_wallets/getArtistAddresses',
  () => ({ default: vi.fn() })
);

import getArtistAddresses from '@/lib/supabase/in_process_artist_social_wallets/getArtistAddresses';
import getArtistWalletHandler from '@/lib/artists/getArtistWalletHandler';

describe('getArtistWalletHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns artist address when social wallet is connected', async () => {
    vi.mocked(getArtistAddresses).mockResolvedValue({
      data: [{ artist_address: '0xartist' }],
      error: null,
    } as any);

    const res = await getArtistWalletHandler('0xSocialWallet');
    const json = await res.json();

    expect(json).toEqual({ address: '0xartist' });
    expect(getArtistAddresses).toHaveBeenCalledWith(['0xsocialwallet']);
  });

  it('throws when artist is not connected', async () => {
    vi.mocked(getArtistAddresses).mockResolvedValue({
      data: [],
      error: null,
    } as any);

    await expect(getArtistWalletHandler('0xsocial')).rejects.toThrow(
      'artist is not connected.'
    );
  });

  it('returns 500 when supabase returns an error', async () => {
    vi.mocked(getArtistAddresses).mockResolvedValue({
      data: null,
      error: { message: 'DB error' },
    } as any);

    const res = await getArtistWalletHandler('0xsocial');

    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json).toEqual({ message: 'DB error' });
  });

  it('lowercases the social wallet before querying', async () => {
    vi.mocked(getArtistAddresses).mockResolvedValue({
      data: [{ artist_address: '0xartist' }],
      error: null,
    } as any);

    await getArtistWalletHandler('0xABCDEF');

    expect(getArtistAddresses).toHaveBeenCalledWith(['0xabcdef']);
  });
});
