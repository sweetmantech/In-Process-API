import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthMethod } from '@/types/auth';

vi.mock('@/lib/privy/getAddressesByAuthToken', () => ({
  getAddressesByAuthToken: vi.fn(),
}));
vi.mock('@/lib/privy/isPrivyWalletAddress', () => ({
  default: vi.fn(),
}));
vi.mock('@/lib/api-keys/getArtistAddressByApiKey', () => ({
  getArtistAddressByApiKey: vi.fn(),
}));
vi.mock('@/lib/auth/authenticateWithFarcasterToken', () => ({
  default: vi.fn(),
}));
vi.mock(
  '@/lib/supabase/in_process_artist_social_wallets/getArtistAddresses',
  () => ({ default: vi.fn() })
);
vi.mock(
  '@/lib/supabase/in_process_artist_social_wallets/selectSocialWallets',
  () => ({ selectSocialWallets: vi.fn() })
);

import { getAddressesByAuthToken } from '@/lib/privy/getAddressesByAuthToken';
import isPrivyWalletAddress from '@/lib/privy/isPrivyWalletAddress';
import { getArtistAddressByApiKey } from '@/lib/api-keys/getArtistAddressByApiKey';
import authenticateWithFarcasterToken from '@/lib/auth/authenticateWithFarcasterToken';
import getArtistAddresses from '@/lib/supabase/in_process_artist_social_wallets/getArtistAddresses';
import { selectSocialWallets } from '@/lib/supabase/in_process_artist_social_wallets/selectSocialWallets';
import getArtistWalletHandler from '@/lib/artists/getArtistWalletHandler';

describe('getArtistWalletHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns wallets from Privy auth token', async () => {
    vi.mocked(getAddressesByAuthToken).mockResolvedValue({
      artistAddress: '0xartist',
      socialWallet: '0xsocial',
    });

    const res = await getArtistWalletHandler({
      method: AuthMethod.Privy,
      token: 'privy-token',
    });
    const json = await res.json();

    expect(json).toEqual({
      artist_wallet: '0xartist',
      social_wallet: '0xsocial',
    });
  });

  it('returns social wallet for Farcaster auth', async () => {
    vi.mocked(authenticateWithFarcasterToken).mockResolvedValue({
      artistAddress: '0xartist',
      authMethod: AuthMethod.Farcaster,
    });
    vi.mocked(selectSocialWallets).mockResolvedValue({
      data: [{ social_wallet: '0xsocial' }],
      error: null,
    });

    const res = await getArtistWalletHandler({
      method: AuthMethod.Farcaster,
      token: 'fc-token',
    });
    const json = await res.json();

    expect(json).toEqual({
      artist_wallet: '0xartist',
      social_wallet: '0xsocial',
    });
  });

  it('reverse-looks up artist wallet when api key address is a privy wallet', async () => {
    vi.mocked(getArtistAddressByApiKey).mockResolvedValue('0xSocialWallet');
    vi.mocked(isPrivyWalletAddress).mockResolvedValue(true);
    vi.mocked(getArtistAddresses).mockResolvedValue({
      data: [{ artist_address: '0xartist' }],
      error: null,
    } as any);

    const res = await getArtistWalletHandler({
      method: AuthMethod.ApiKey,
      token: 'api-key',
    });
    const json = await res.json();

    expect(isPrivyWalletAddress).toHaveBeenCalledWith('0xSocialWallet');
    expect(getArtistAddresses).toHaveBeenCalledWith(['0xSocialWallet']);
    expect(selectSocialWallets).not.toHaveBeenCalled();
    expect(json).toEqual({
      artist_wallet: '0xartist',
      social_wallet: '0xSocialWallet',
    });
  });

  it('returns social wallet as address when privy wallet is not connected', async () => {
    vi.mocked(getArtistAddressByApiKey).mockResolvedValue('0xSocialWallet');
    vi.mocked(isPrivyWalletAddress).mockResolvedValue(true);
    vi.mocked(getArtistAddresses).mockResolvedValue({
      data: [],
      error: null,
    } as any);

    const res = await getArtistWalletHandler({
      method: AuthMethod.ApiKey,
      token: 'api-key',
    });
    const json = await res.json();

    expect(json).toEqual({
      social_wallet: '0xSocialWallet',
    });
  });

  it('looks up social wallet when api key address is an artist wallet', async () => {
    vi.mocked(getArtistAddressByApiKey).mockResolvedValue('0xArtistWallet');
    vi.mocked(isPrivyWalletAddress).mockResolvedValue(false);
    vi.mocked(selectSocialWallets).mockResolvedValue({
      data: [{ social_wallet: '0xsocial' }],
      error: null,
    });

    const res = await getArtistWalletHandler({
      method: AuthMethod.ApiKey,
      token: 'api-key',
    });
    const json = await res.json();

    expect(selectSocialWallets).toHaveBeenCalledWith({
      artistAddress: '0xArtistWallet',
    });
    expect(getArtistAddresses).not.toHaveBeenCalled();
    expect(json).toEqual({
      artist_wallet: '0xArtistWallet',
      social_wallet: '0xsocial',
    });
  });

  it('returns 500 when supabase returns an error', async () => {
    vi.mocked(getArtistAddressByApiKey).mockResolvedValue('0xartist');
    vi.mocked(isPrivyWalletAddress).mockResolvedValue(false);
    vi.mocked(selectSocialWallets).mockResolvedValue({
      data: null,
      error: { message: 'DB error' },
    } as any);

    const res = await getArtistWalletHandler({
      method: AuthMethod.ApiKey,
      token: 'api-key',
    });

    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ message: 'DB error' });
  });
});
