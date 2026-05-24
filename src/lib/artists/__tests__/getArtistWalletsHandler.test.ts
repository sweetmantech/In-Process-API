import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthMethod } from '@/types/auth';

vi.mock('@/lib/privy/getAddressesByPrivyToken', () => ({
  getAddressesByPrivyToken: vi.fn(),
}));
vi.mock('@/lib/privy/isPrivyWalletAddress', () => ({
  default: vi.fn(),
}));
vi.mock('@/lib/api-keys/getAuthorizedAddressByApiKey', () => ({
  getAuthorizedAddressByApiKey: vi.fn(),
}));
vi.mock('@/lib/auth/authenticateWithFarcasterToken', () => ({
  default: vi.fn(),
}));
vi.mock(
  '@/lib/supabase/in_process_artist_social_wallets/selectSocialWallets',
  () => ({ default: vi.fn() })
);
vi.mock('@/lib/supabase/in_process_artists/selectArtists', () => ({
  default: vi.fn(),
}));
vi.mock('@/lib/artists/getFarcasterSocialWallet', () => ({
  default: vi.fn(),
}));

import { getAddressesByPrivyToken } from '@/lib/privy/getAddressesByPrivyToken';
import isPrivyWalletAddress from '@/lib/privy/isPrivyWalletAddress';
import { getAuthorizedAddressByApiKey } from '@/lib/api-keys/getAuthorizedAddressByApiKey';
import authenticateWithFarcasterToken from '@/lib/auth/authenticateWithFarcasterToken';
import selectSocialWallets from '@/lib/supabase/in_process_artist_social_wallets/selectSocialWallets';
import selectArtists from '@/lib/supabase/in_process_artists/selectArtists';
import getFarcasterSocialWallet from '@/lib/artists/getFarcasterSocialWallet';
import getArtistWalletsHandler from '@/lib/artists/getArtistWalletsHandler';

describe('getArtistWalletsHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getFarcasterSocialWallet).mockResolvedValue(undefined);
  });

  describe('Privy auth', () => {
    it('returns artist_wallet and social_wallets from Privy token', async () => {
      vi.mocked(getAddressesByPrivyToken).mockResolvedValue({
        artistAddress: '0xartist',
        socialWallet: '0xsocial',
      });
      vi.mocked(getFarcasterSocialWallet).mockResolvedValue('0xfarcaster');

      const res = await getArtistWalletsHandler({
        method: AuthMethod.Privy,
        token: 'privy-token',
      });
      const json = await res.json();

      expect(json).toEqual({
        artist_wallet: '0xartist',
        social_wallets: ['0xsocial', '0xfarcaster'],
      });
    });

    it('uses socialWallet as profileAddress when artistAddress is undefined', async () => {
      vi.mocked(getAddressesByPrivyToken).mockResolvedValue({
        artistAddress: undefined,
        socialWallet: '0xsocial',
      });

      const res = await getArtistWalletsHandler({
        method: AuthMethod.Privy,
        token: 'privy-token',
      });
      const json = await res.json();

      expect(getFarcasterSocialWallet).toHaveBeenCalledWith('0xsocial');
      expect(json.artist_wallet).toBeUndefined();
    });
  });

  describe('Farcaster auth', () => {
    it('returns artist_wallet from profile lookup and farcaster address in social_wallets', async () => {
      vi.mocked(authenticateWithFarcasterToken).mockResolvedValue({
        artistAddress: '0xfarcaster',
        farcasterUsername: 'testuser',
        authMethod: AuthMethod.Farcaster,
      });
      vi.mocked(selectArtists).mockResolvedValue({
        data: [{ address: '0xartist' }],
        error: null,
      } as any);
      vi.mocked(isPrivyWalletAddress).mockResolvedValue(false);

      const res = await getArtistWalletsHandler({
        method: AuthMethod.Farcaster,
        token: 'fc-token',
      });
      const json = await res.json();

      expect(json).toEqual({
        artist_wallet: '0xartist',
        social_wallets: ['0xfarcaster'],
      });
    });

    it('resolves artist_wallet via selectSocialWallets and adds privy address to social_wallets when profile is privy', async () => {
      vi.mocked(authenticateWithFarcasterToken).mockResolvedValue({
        artistAddress: '0xfarcaster',
        farcasterUsername: 'testuser',
        authMethod: AuthMethod.Farcaster,
      });
      vi.mocked(selectArtists).mockResolvedValue({
        data: [{ address: '0xprivy' }],
        error: null,
      } as any);
      vi.mocked(isPrivyWalletAddress).mockResolvedValue(true);
      vi.mocked(selectSocialWallets).mockResolvedValue({
        data: [{ artist_address: '0xartist' }],
        error: null,
      } as any);

      const res = await getArtistWalletsHandler({
        method: AuthMethod.Farcaster,
        token: 'fc-token',
      });
      const json = await res.json();

      expect(json).toEqual({
        artist_wallet: '0xartist',
        social_wallets: ['0xprivy', '0xfarcaster'],
      });
    });

    it('returns undefined artist_wallet when no farcasterUsername', async () => {
      vi.mocked(authenticateWithFarcasterToken).mockResolvedValue({
        artistAddress: '0xfarcaster',
        farcasterUsername: undefined,
        authMethod: AuthMethod.Farcaster,
      });

      const res = await getArtistWalletsHandler({
        method: AuthMethod.Farcaster,
        token: 'fc-token',
      });
      const json = await res.json();

      expect(json).toEqual({
        artist_wallet: undefined,
        social_wallets: ['0xfarcaster'],
      });
    });
  });

  describe('ApiKey auth', () => {
    it('resolves artist_wallet and social_wallets when api key address is a privy wallet', async () => {
      vi.mocked(getAuthorizedAddressByApiKey).mockResolvedValue(
        '0xSocialWallet'
      );
      vi.mocked(isPrivyWalletAddress).mockResolvedValue(true);
      vi.mocked(selectSocialWallets).mockResolvedValue({
        data: [{ artist_address: '0xartist' }],
        error: null,
      } as any);
      vi.mocked(getFarcasterSocialWallet).mockResolvedValue('0xfarcaster');

      const res = await getArtistWalletsHandler({
        method: AuthMethod.ApiKey,
        token: 'api-key',
      });
      const json = await res.json();

      expect(isPrivyWalletAddress).toHaveBeenCalledWith('0xSocialWallet');
      expect(selectSocialWallets).toHaveBeenCalledWith({
        socialWallets: ['0xSocialWallet'],
      });
      expect(json).toEqual({
        artist_wallet: '0xartist',
        social_wallets: ['0xSocialWallet', '0xfarcaster'],
      });
    });

    it('returns social_wallets when api key address is an artist wallet', async () => {
      vi.mocked(getAuthorizedAddressByApiKey).mockResolvedValue(
        '0xArtistWallet'
      );
      vi.mocked(isPrivyWalletAddress).mockResolvedValue(false);
      vi.mocked(selectSocialWallets).mockResolvedValue({
        data: [{ social_wallet: '0xsocial' }],
        error: null,
      } as any);
      vi.mocked(getFarcasterSocialWallet).mockResolvedValue('0xfarcaster');

      const res = await getArtistWalletsHandler({
        method: AuthMethod.ApiKey,
        token: 'api-key',
      });
      const json = await res.json();

      expect(selectSocialWallets).toHaveBeenCalledWith({
        artistAddress: '0xArtistWallet',
      });
      expect(json).toEqual({
        artist_wallet: '0xArtistWallet',
        social_wallets: ['0xsocial', '0xfarcaster'],
      });
    });

    it('returns 500 when selectSocialWallets returns an error', async () => {
      vi.mocked(getAuthorizedAddressByApiKey).mockResolvedValue('0xartist');
      vi.mocked(isPrivyWalletAddress).mockResolvedValue(false);
      vi.mocked(selectSocialWallets).mockResolvedValue({
        data: null,
        error: { message: 'DB error' },
      } as any);

      const res = await getArtistWalletsHandler({
        method: AuthMethod.ApiKey,
        token: 'api-key',
      });

      expect(res.status).toBe(500);
      expect(await res.json()).toEqual({ message: 'DB error' });
    });
  });
});
