import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock(
  '@/lib/supabase/in_process_artist_social_wallets/removeSocialWallet',
  () => ({ removeSocialWallet: vi.fn() })
);

import { removeSocialWallet } from '@/lib/supabase/in_process_artist_social_wallets/removeSocialWallet';
import disconnectArtistWalletHandler from '@/lib/artists/disconnectArtistWalletHandler';

describe('disconnectArtistWalletHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns success when wallet is disconnected', async () => {
    vi.mocked(removeSocialWallet).mockResolvedValue({ error: null } as any);

    const res = await disconnectArtistWalletHandler('0xsocial');
    const json = await res.json();

    expect(json).toEqual({ success: true });
  });

  it('lowercases the social wallet before removing', async () => {
    vi.mocked(removeSocialWallet).mockResolvedValue({ error: null } as any);

    await disconnectArtistWalletHandler('0xSOCIAL');

    expect(removeSocialWallet).toHaveBeenCalledWith({
      social_wallet: '0xsocial',
    });
  });

  it('throws when social wallet is not connected', async () => {
    vi.mocked(removeSocialWallet).mockResolvedValue({
      error: { message: 'not found' },
    } as any);

    await expect(disconnectArtistWalletHandler('0xsocial')).rejects.toThrow(
      'social wallet is not connected.'
    );
  });
});
