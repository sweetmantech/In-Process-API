import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock(
  '@/lib/supabase/in_process_artist_social_wallets/insertSocialWallet',
  () => ({ insertSocialWallet: vi.fn() })
);
vi.mock('@/lib/supabase/in_process_api_keys/getApiKeys', () => ({
  getApiKeys: vi.fn(),
}));
vi.mock('@/lib/supabase/in_process_api_keys/updateArtistAddress', () => ({
  updateArtistAddress: vi.fn(),
}));
vi.mock('@/lib/artists/ensureArtists', () => ({
  ensureArtists: vi.fn(),
}));

import { insertSocialWallet } from '@/lib/supabase/in_process_artist_social_wallets/insertSocialWallet';
import { getApiKeys } from '@/lib/supabase/in_process_api_keys/getApiKeys';
import { updateArtistAddress } from '@/lib/supabase/in_process_api_keys/updateArtistAddress';
import { ensureArtists } from '@/lib/artists/ensureArtists';
import connectArtistWalletHandler from '@/lib/artists/connectArtistWalletHandler';

describe('connectArtistWalletHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(ensureArtists).mockResolvedValue(undefined);
    vi.mocked(getApiKeys).mockResolvedValue({ data: [], error: null } as any);
    vi.mocked(updateArtistAddress).mockResolvedValue({ error: null } as any);
  });

  it('returns success when wallet is connected', async () => {
    vi.mocked(insertSocialWallet).mockResolvedValue({ error: null } as any);

    const res = await connectArtistWalletHandler({
      artist_wallet: '0xa123456789012345678901234567890123456789',
      social_wallet: '0xb234567890123456789012345678901234567891',
    });
    const json = await res.json();

    expect(ensureArtists).toHaveBeenCalledWith([
      '0xa123456789012345678901234567890123456789',
    ]);
    expect(json).toEqual({ success: true });
  });

  it('lowercases artist and social wallet before insertSocialWallet', async () => {
    vi.mocked(insertSocialWallet).mockResolvedValue({ error: null } as any);
    vi.mocked(getApiKeys).mockResolvedValue({
      data: [{ id: 'key-1' } as any],
      error: null,
    } as any);

    await connectArtistWalletHandler({
      artist_wallet: '0xA123456789012345678901234567890123456789',
      social_wallet: '0xB234567890123456789012345678901234567891',
    });

    expect(ensureArtists).toHaveBeenCalledWith([
      '0xa123456789012345678901234567890123456789',
    ]);
    expect(updateArtistAddress).toHaveBeenCalledWith(
      'key-1',
      '0xa123456789012345678901234567890123456789'
    );
    expect(insertSocialWallet).toHaveBeenCalledWith({
      artist_address: '0xa123456789012345678901234567890123456789',
      social_wallet: '0xb234567890123456789012345678901234567891',
    });
  });

  it('throws when social wallet is already connected', async () => {
    vi.mocked(insertSocialWallet).mockResolvedValue({
      error: { message: 'duplicate' },
    } as any);

    await expect(
      connectArtistWalletHandler({
        artist_wallet: '0xa123456789012345678901234567890123456789',
        social_wallet: '0xb234567890123456789012345678901234567891',
      })
    ).rejects.toThrow('social_wallet is connected already.');
  });
});
