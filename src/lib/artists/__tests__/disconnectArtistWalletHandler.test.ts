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
vi.mock('@/lib/supabase/in_process_wallets/selectWallets', () => ({
  default: vi.fn(),
}));
vi.mock('@/lib/supabase/in_process_artists/selectArtists', () => ({
  default: vi.fn(),
}));
vi.mock('@/lib/artists/disconnectWallets', () => ({
  default: vi.fn(),
}));

import { AuthMethod } from '@/types/auth';
import { getAddressesByPrivyToken } from '@/lib/privy/getAddressesByPrivyToken';
import authenticateWithApiKey from '@/lib/auth/authenticateWithApiKey';
import isPrivyWalletAddress from '@/lib/privy/isPrivyWalletAddress';
import selectWallets from '@/lib/supabase/in_process_wallets/selectWallets';
import selectArtists from '@/lib/supabase/in_process_artists/selectArtists';
import disconnectWallets from '@/lib/artists/disconnectWallets';
import disconnectArtistWalletHandler from '@/lib/artists/disconnectArtistWalletHandler';

const SOCIAL = '0xsocial';
const EXTERNAL = '0xexternal';
const ARTIST_UUID = 'uuid-artist-1234';
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
      vi.mocked(selectWallets)
        .mockResolvedValueOnce({
          data: [{ artist_id: ARTIST_UUID }],
          error: null,
        } as any)
        .mockResolvedValueOnce({
          data: [{ address: EXTERNAL }],
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

    it('throws when artistId not found', async () => {
      vi.mocked(selectWallets).mockResolvedValue({
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

    it('throws when external wallet not found', async () => {
      vi.mocked(selectWallets)
        .mockResolvedValueOnce({
          data: [{ artist_id: ARTIST_UUID }],
          error: null,
        } as any)
        .mockResolvedValueOnce({ data: [], error: null } as any);
      await expect(
        disconnectArtistWalletHandler({
          method: AuthMethod.ApiKey,
          token: TOKEN,
        })
      ).rejects.toThrow('External wallet not found');
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
      vi.mocked(selectArtists).mockResolvedValue({
        data: [{ id: ARTIST_UUID }],
        error: null,
      } as any);
      vi.mocked(selectWallets).mockResolvedValue({
        data: [{ address: SOCIAL }],
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

    it('throws when artist not found', async () => {
      vi.mocked(selectArtists).mockResolvedValue({
        data: [],
        error: null,
      } as any);
      await expect(
        disconnectArtistWalletHandler({
          method: AuthMethod.ApiKey,
          token: TOKEN,
        })
      ).rejects.toThrow('Artist not found');
    });

    it('throws when social wallet not found', async () => {
      vi.mocked(selectArtists).mockResolvedValue({
        data: [{ id: ARTIST_UUID }],
        error: null,
      } as any);
      vi.mocked(selectWallets).mockResolvedValue({
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
  });
});
