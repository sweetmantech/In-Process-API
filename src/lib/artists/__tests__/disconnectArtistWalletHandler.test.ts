import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/privy/getAddressesByPrivyToken', () => ({
  getAddressesByPrivyToken: vi.fn(),
}));
vi.mock('@/lib/auth/authenticateWithApiKey', () => ({
  default: vi.fn(),
}));
vi.mock('@/lib/privy/isPrivyWalletAddress', () => ({
  default: vi.fn(),
}));
vi.mock(
  '@/lib/supabase/in_process_artist_social_wallets/selectSocialWallets',
  () => ({
    default: vi.fn(),
  })
);
vi.mock('@/lib/artists/disconnectWallets', () => ({
  default: vi.fn(),
}));

import { AuthMethod } from '@/types/auth';
import { getAddressesByPrivyToken } from '@/lib/privy/getAddressesByPrivyToken';
import authenticateWithApiKey from '@/lib/auth/authenticateWithApiKey';
import isPrivyWalletAddress from '@/lib/privy/isPrivyWalletAddress';
import selectSocialWallets from '@/lib/supabase/in_process_artist_social_wallets/selectSocialWallets';
import disconnectWallets from '@/lib/artists/disconnectWallets';
import disconnectArtistWalletHandler from '@/lib/artists/disconnectArtistWalletHandler';

const SOCIAL = '0xsocial';
const EXTERNAL = '0xexternal';
const TOKEN = 'test-token';

describe('disconnectArtistWalletHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(disconnectWallets).mockResolvedValue(undefined);
  });

  describe('Privy path', () => {
    it('returns success and calls disconnectWallets with correct args', async () => {
      vi.mocked(getAddressesByPrivyToken).mockResolvedValue({
        artistAddress: EXTERNAL,
        socialWallet: SOCIAL,
      });

      const res = await disconnectArtistWalletHandler({
        method: AuthMethod.Privy,
        token: TOKEN,
      });
      const json = await res.json();

      expect(json).toEqual({ success: true });
      expect(disconnectWallets).toHaveBeenCalledWith({
        social_wallet: SOCIAL,
        external_wallet: EXTERNAL,
      });
    });

    it('throws when socialWallet is missing', async () => {
      vi.mocked(getAddressesByPrivyToken).mockResolvedValue({
        artistAddress: EXTERNAL,
        socialWallet: undefined,
      });

      await expect(
        disconnectArtistWalletHandler({
          method: AuthMethod.Privy,
          token: TOKEN,
        })
      ).rejects.toThrow('In*Process wallet not found');
    });

    it('throws when externalWallet is missing', async () => {
      vi.mocked(getAddressesByPrivyToken).mockResolvedValue({
        artistAddress: undefined,
        socialWallet: SOCIAL,
      });

      await expect(
        disconnectArtistWalletHandler({
          method: AuthMethod.Privy,
          token: TOKEN,
        })
      ).rejects.toThrow('External wallet not found');
    });
  });

  describe('ApiKey path — caller is the social wallet (isPrivySocialWallet=true)', () => {
    beforeEach(() => {
      vi.mocked(authenticateWithApiKey).mockResolvedValue({
        artistAddress: SOCIAL,
        authMethod: AuthMethod.ApiKey,
      });
      vi.mocked(isPrivyWalletAddress).mockResolvedValue(true);
    });

    it('returns success and calls disconnectWallets with correct args', async () => {
      vi.mocked(selectSocialWallets).mockResolvedValue({
        data: [{ artist_address: EXTERNAL, social_wallet: SOCIAL }],
        error: null,
      } as any);

      const res = await disconnectArtistWalletHandler({
        method: AuthMethod.ApiKey,
        token: TOKEN,
      });
      const json = await res.json();

      expect(json).toEqual({ success: true });
      expect(disconnectWallets).toHaveBeenCalledWith({
        social_wallet: SOCIAL,
        external_wallet: EXTERNAL,
      });
    });

    it('throws when external wallet is not found in DB', async () => {
      vi.mocked(selectSocialWallets).mockResolvedValue({
        data: [],
        error: null,
      } as any);

      await expect(
        disconnectArtistWalletHandler({
          method: AuthMethod.ApiKey,
          token: TOKEN,
        })
      ).rejects.toThrow('External wallet not found');
    });

    it('throws when selectSocialWallets returns an error', async () => {
      vi.mocked(selectSocialWallets).mockResolvedValue({
        data: null,
        error: { message: 'db error' },
      } as any);

      await expect(
        disconnectArtistWalletHandler({
          method: AuthMethod.ApiKey,
          token: TOKEN,
        })
      ).rejects.toThrow('db error');
    });
  });

  describe('ApiKey path — caller is the external wallet (isPrivySocialWallet=false)', () => {
    beforeEach(() => {
      vi.mocked(authenticateWithApiKey).mockResolvedValue({
        artistAddress: EXTERNAL,
        authMethod: AuthMethod.ApiKey,
      });
      vi.mocked(isPrivyWalletAddress).mockResolvedValue(false);
    });

    it('returns success and calls disconnectWallets with correct args', async () => {
      vi.mocked(selectSocialWallets).mockResolvedValue({
        data: [{ artist_address: EXTERNAL, social_wallet: SOCIAL }],
        error: null,
      } as any);

      const res = await disconnectArtistWalletHandler({
        method: AuthMethod.ApiKey,
        token: TOKEN,
      });
      const json = await res.json();

      expect(json).toEqual({ success: true });
      expect(disconnectWallets).toHaveBeenCalledWith({
        social_wallet: SOCIAL,
        external_wallet: EXTERNAL,
      });
    });

    it('throws when social wallet is not found in DB', async () => {
      vi.mocked(selectSocialWallets).mockResolvedValue({
        data: [],
        error: null,
      } as any);

      await expect(
        disconnectArtistWalletHandler({
          method: AuthMethod.ApiKey,
          token: TOKEN,
        })
      ).rejects.toThrow('In*Process wallet not found');
    });

    it('throws when selectSocialWallets returns an error', async () => {
      vi.mocked(selectSocialWallets).mockResolvedValue({
        data: null,
        error: { message: 'db error' },
      } as any);

      await expect(
        disconnectArtistWalletHandler({
          method: AuthMethod.ApiKey,
          token: TOKEN,
        })
      ).rejects.toThrow('db error');
    });
  });
});
