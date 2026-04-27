import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock(
  '@/lib/supabase/in_process_artist_social_wallets/insertSocialWallet',
  () => ({ insertSocialWallet: vi.fn() })
);

import { insertSocialWallet } from '@/lib/supabase/in_process_artist_social_wallets/insertSocialWallet';
import connectArtistWalletHandler from '@/lib/artists/connectArtistWalletHandler';

describe('connectArtistWalletHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns success when wallet is connected', async () => {
    vi.mocked(insertSocialWallet).mockResolvedValue({ error: null } as any);

    const res = await connectArtistWalletHandler('0xArtist', '0xSocial');
    const json = await res.json();

    expect(json).toEqual({ success: true });
  });

  it('lowercases artist and social wallet before insertSocialWallet', async () => {
    vi.mocked(insertSocialWallet).mockResolvedValue({ error: null } as any);

    await connectArtistWalletHandler('0xARTIST', '0xSOCIAL');

    expect(insertSocialWallet).toHaveBeenCalledWith({
      artist_address: '0xartist',
      social_wallet: '0xsocial',
    });
  });

  it('throws when social wallet is already connected', async () => {
    vi.mocked(insertSocialWallet).mockResolvedValue({
      error: { message: 'duplicate' },
    } as any);

    await expect(
      connectArtistWalletHandler('0xartist', '0xsocial')
    ).rejects.toThrow('social_wallet is connected already.');
  });
});
