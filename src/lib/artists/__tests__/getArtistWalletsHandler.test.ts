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
vi.mock('@/lib/supabase/in_process_wallets/selectWallets', () => ({
  default: vi.fn(),
}));
vi.mock('@/lib/artists/getFarcasterSocialWallet', () => ({
  default: vi.fn(),
}));

import { getAddressesByPrivyToken } from '@/lib/privy/getAddressesByPrivyToken';
import isPrivyWalletAddress from '@/lib/privy/isPrivyWalletAddress';
import { getAuthorizedAddressByApiKey } from '@/lib/api-keys/getAuthorizedAddressByApiKey';
import authenticateWithFarcasterToken from '@/lib/auth/authenticateWithFarcasterToken';
import selectWallets from '@/lib/supabase/in_process_wallets/selectWallets';
import getFarcasterSocialWallet from '@/lib/artists/getFarcasterSocialWallet';
import getArtistWalletsHandler from '@/lib/artists/getArtistWalletsHandler';

const ARTIST_UUID = 'uuid-artist-1234';

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
    it('returns external wallet as artist_wallet when no privy wallet exists', async () => {
      vi.mocked(authenticateWithFarcasterToken).mockResolvedValue({
        artistAddress: '0xfarcaster',
        farcasterUsername: 'testuser',
        authMethod: AuthMethod.Farcaster,
      });
      vi.mocked(selectWallets)
        .mockResolvedValueOnce({
          data: [{ artist: ARTIST_UUID }],
          error: null,
        } as any)
        .mockResolvedValueOnce({
          data: [
            { address: '0xfarcaster', type: 'farcaster' },
            { address: '0xartist', type: 'external' },
          ],
          error: null,
        } as any);

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

    it('returns external wallet as artist_wallet and surfaces privy in social_wallets', async () => {
      vi.mocked(authenticateWithFarcasterToken).mockResolvedValue({
        artistAddress: '0xfarcaster',
        farcasterUsername: 'testuser',
        authMethod: AuthMethod.Farcaster,
      });
      vi.mocked(selectWallets)
        .mockResolvedValueOnce({
          data: [{ artist: ARTIST_UUID }],
          error: null,
        } as any)
        .mockResolvedValueOnce({
          data: [
            { address: '0xfarcaster', type: 'farcaster' },
            { address: '0xprivy', type: 'privy' },
            { address: '0xartist', type: 'external' },
          ],
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

    it('falls back to privy wallet when external wallet is missing', async () => {
      vi.mocked(authenticateWithFarcasterToken).mockResolvedValue({
        artistAddress: '0xfarcaster',
        farcasterUsername: 'testuser',
        authMethod: AuthMethod.Farcaster,
      });
      vi.mocked(selectWallets)
        .mockResolvedValueOnce({
          data: [{ artist: ARTIST_UUID }],
          error: null,
        } as any)
        .mockResolvedValueOnce({
          data: [
            { address: '0xfarcaster', type: 'farcaster' },
            { address: '0xprivy', type: 'privy' },
          ],
          error: null,
        } as any);

      const res = await getArtistWalletsHandler({
        method: AuthMethod.Farcaster,
        token: 'fc-token',
      });
      const json = await res.json();

      expect(json).toEqual({
        artist_wallet: '0xprivy',
        social_wallets: ['0xfarcaster'],
      });
    });

    it('returns undefined artist_wallet when wallet not found in DB', async () => {
      vi.mocked(authenticateWithFarcasterToken).mockResolvedValue({
        artistAddress: '0xfarcaster',
        farcasterUsername: undefined,
        authMethod: AuthMethod.Farcaster,
      });
      vi.mocked(selectWallets).mockResolvedValue({ data: [], error: null } as any);

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
      vi.mocked(getAuthorizedAddressByApiKey).mockResolvedValue('0xSocialWallet');
      vi.mocked(isPrivyWalletAddress).mockResolvedValue(true);
      vi.mocked(selectWallets)
        .mockResolvedValueOnce({ data: [{ artist: ARTIST_UUID }], error: null } as any)
        .mockResolvedValueOnce({ data: [{ address: '0xartist' }], error: null } as any);
      vi.mocked(getFarcasterSocialWallet).mockResolvedValue('0xfarcaster');

      const res = await getArtistWalletsHandler({
        method: AuthMethod.ApiKey,
        token: 'api-key',
      });
      const json = await res.json();

      expect(isPrivyWalletAddress).toHaveBeenCalledWith('0xSocialWallet');
      expect(selectWallets).toHaveBeenCalledWith({ addresses: ['0xSocialWallet'] });
      expect(json).toEqual({
        artist_wallet: '0xartist',
        social_wallets: ['0xSocialWallet', '0xfarcaster'],
      });
    });

    it('returns artist_wallet and social_wallets when api key address is an external wallet', async () => {
      vi.mocked(getAuthorizedAddressByApiKey).mockResolvedValue('0xArtistWallet');
      vi.mocked(isPrivyWalletAddress).mockResolvedValue(false);
      vi.mocked(selectWallets)
        .mockResolvedValueOnce({ data: [{ artist: ARTIST_UUID }], error: null } as any)
        .mockResolvedValueOnce({ data: [{ address: '0xsocial' }], error: null } as any);
      vi.mocked(getFarcasterSocialWallet).mockResolvedValue('0xfarcaster');

      const res = await getArtistWalletsHandler({
        method: AuthMethod.ApiKey,
        token: 'api-key',
      });
      const json = await res.json();

      expect(selectWallets).toHaveBeenCalledWith({ addresses: ['0xArtistWallet'] });
      expect(json).toEqual({
        artist_wallet: '0xArtistWallet',
        social_wallets: ['0xsocial', '0xfarcaster'],
      });
    });

    it('throws when selectWallets throws', async () => {
      vi.mocked(getAuthorizedAddressByApiKey).mockResolvedValue('0xartist');
      vi.mocked(isPrivyWalletAddress).mockResolvedValue(false);
      vi.mocked(selectWallets).mockRejectedValue(new Error('DB error'));

      await expect(
        getArtistWalletsHandler({ method: AuthMethod.ApiKey, token: 'api-key' })
      ).rejects.toThrow('DB error');
    });
  });
});
