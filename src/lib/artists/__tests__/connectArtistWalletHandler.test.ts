import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/coinbase/getOrCreateSmartWallet', () => ({
  getOrCreateSmartWallet: vi.fn(),
}));

vi.mock('@/lib/supabase/in_process_artists/upsertProfile', () => ({
  upsertProfile: vi.fn(),
}));

vi.mock(
  '@/lib/supabase/in_process_artist_social_wallets/insertSocialWallet',
  () => ({ insertSocialWallet: vi.fn() })
);

import { getOrCreateSmartWallet } from '@/lib/coinbase/getOrCreateSmartWallet';
import { upsertProfile } from '@/lib/supabase/in_process_artists/upsertProfile';
import { insertSocialWallet } from '@/lib/supabase/in_process_artist_social_wallets/insertSocialWallet';
import connectArtistWalletHandler from '@/lib/artists/connectArtistWalletHandler';

describe('connectArtistWalletHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns success when wallet is connected', async () => {
    vi.mocked(getOrCreateSmartWallet).mockResolvedValue({
      address: '0xsmart',
    } as any);
    vi.mocked(upsertProfile).mockResolvedValue({ error: null } as any);
    vi.mocked(insertSocialWallet).mockResolvedValue({ error: null } as any);

    const res = await connectArtistWalletHandler('0xArtist', '0xSocial');
    const json = await res.json();

    expect(json).toEqual({ success: true });
  });

  it('lowercases artist and social wallet before processing', async () => {
    vi.mocked(getOrCreateSmartWallet).mockResolvedValue({
      address: '0xsmart',
    } as any);
    vi.mocked(upsertProfile).mockResolvedValue({ error: null } as any);
    vi.mocked(insertSocialWallet).mockResolvedValue({ error: null } as any);

    await connectArtistWalletHandler('0xARTIST', '0xSOCIAL');

    expect(getOrCreateSmartWallet).toHaveBeenCalledWith({
      address: '0xartist',
    });
    expect(insertSocialWallet).toHaveBeenCalledWith({
      artist_address: '0xartist',
      social_wallet: '0xsocial',
    });
  });

  it('throws when social wallet is already connected', async () => {
    vi.mocked(getOrCreateSmartWallet).mockResolvedValue({
      address: '0xsmart',
    } as any);
    vi.mocked(upsertProfile).mockResolvedValue({ error: null } as any);
    vi.mocked(insertSocialWallet).mockResolvedValue({
      error: { message: 'duplicate' },
    } as any);

    await expect(
      connectArtistWalletHandler('0xartist', '0xsocial')
    ).rejects.toThrow('social_wallet is connected already.');
  });

  it('throws when upsertProfile fails', async () => {
    vi.mocked(getOrCreateSmartWallet).mockResolvedValue({
      address: '0xsmart',
    } as any);
    vi.mocked(upsertProfile).mockResolvedValue({
      error: { message: 'upsert failed' },
    } as any);
    vi.mocked(insertSocialWallet).mockResolvedValue({ error: null } as any);

    await expect(
      connectArtistWalletHandler('0xartist', '0xsocial')
    ).rejects.toThrow();
  });
});
