import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Address } from 'viem';

vi.mock(
  '@/lib/supabase/in_process_artist_social_wallets/selectSocialWallets',
  () => ({ selectSocialWallets: vi.fn() })
);
vi.mock(
  '@/lib/supabase/in_process_artist_social_wallets/getArtistAddresses',
  () => ({ default: vi.fn() })
);
vi.mock('@/lib/privy/getEmailByWalletAddress', () => ({ default: vi.fn() }));

import { selectSocialWallets } from '@/lib/supabase/in_process_artist_social_wallets/selectSocialWallets';
import getArtistAddresses from '@/lib/supabase/in_process_artist_social_wallets/getArtistAddresses';
import getEmailByWalletAddress from '@/lib/privy/getEmailByWalletAddress';
import handleMe from '../handleMe';

const ARTIST_ADDRESS = '0xartist' as Address;
const SOCIAL_WALLET = '0xsocial' as Address;

const makeThread = () => ({
  post: vi.fn().mockResolvedValue(undefined),
  channelId: 'telegram:7',
});

beforeEach(() => {
  vi.clearAllMocks();
});

describe('handleMe', () => {
  describe('artistAddress is a real artist address', () => {
    it('posts the linked email found via social wallet', async () => {
      vi.mocked(selectSocialWallets).mockResolvedValue({
        data: [{ social_wallet: SOCIAL_WALLET }],
        error: null,
      });
      vi.mocked(getEmailByWalletAddress).mockResolvedValue('user@example.com');

      const thread = makeThread();
      await handleMe(thread as never, ARTIST_ADDRESS);

      expect(selectSocialWallets).toHaveBeenCalledWith({
        artistAddress: ARTIST_ADDRESS,
      });
      expect(getEmailByWalletAddress).toHaveBeenCalledWith(SOCIAL_WALLET);
      expect(thread.post).toHaveBeenCalledWith(
        'Your linked email: user@example.com'
      );
    });

    it('tries each social wallet and returns the first email found', async () => {
      vi.mocked(selectSocialWallets).mockResolvedValue({
        data: [{ social_wallet: '0xsocial1' }, { social_wallet: '0xsocial2' }],
        error: null,
      });
      vi.mocked(getEmailByWalletAddress)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce('second@example.com');

      const thread = makeThread();
      await handleMe(thread as never, ARTIST_ADDRESS);

      expect(getEmailByWalletAddress).toHaveBeenCalledTimes(2);
      expect(thread.post).toHaveBeenCalledWith(
        'Your linked email: second@example.com'
      );
    });

    it('falls through to getArtistAddresses when no social wallet has an email', async () => {
      vi.mocked(selectSocialWallets).mockResolvedValue({
        data: [{ social_wallet: SOCIAL_WALLET }],
        error: null,
      });
      vi.mocked(getEmailByWalletAddress).mockResolvedValue(null);
      vi.mocked(getArtistAddresses).mockResolvedValue({
        data: [],
        error: null,
      } as never);

      const thread = makeThread();
      await handleMe(thread as never, ARTIST_ADDRESS);

      expect(getArtistAddresses).toHaveBeenCalledWith([ARTIST_ADDRESS]);
      expect(thread.post).toHaveBeenCalledWith(
        'No email address linked to your account.'
      );
    });
  });

  describe('artistAddress is itself a social wallet', () => {
    it('posts the email found directly from the social wallet address', async () => {
      vi.mocked(selectSocialWallets).mockResolvedValue({
        data: [],
        error: null,
      });
      vi.mocked(getArtistAddresses).mockResolvedValue({
        data: [{ social_wallet: ARTIST_ADDRESS, artist_address: '0xreal' }],
        error: null,
      } as never);
      vi.mocked(getEmailByWalletAddress).mockResolvedValue(
        'social@example.com'
      );

      const thread = makeThread();
      await handleMe(thread as never, ARTIST_ADDRESS);

      expect(getArtistAddresses).toHaveBeenCalledWith([ARTIST_ADDRESS]);
      expect(getEmailByWalletAddress).toHaveBeenCalledWith(ARTIST_ADDRESS);
      expect(thread.post).toHaveBeenCalledWith(
        'Your linked email: social@example.com'
      );
    });

    it('posts no email message when social wallet has no Privy email', async () => {
      vi.mocked(selectSocialWallets).mockResolvedValue({
        data: [],
        error: null,
      });
      vi.mocked(getArtistAddresses).mockResolvedValue({
        data: [{ social_wallet: ARTIST_ADDRESS, artist_address: '0xreal' }],
        error: null,
      } as never);
      vi.mocked(getEmailByWalletAddress).mockResolvedValue(null);

      const thread = makeThread();
      await handleMe(thread as never, ARTIST_ADDRESS);

      expect(thread.post).toHaveBeenCalledWith(
        'No email address linked to your account.'
      );
    });
  });

  describe('no linked wallet at all', () => {
    it('posts no email message when both lookups return empty', async () => {
      vi.mocked(selectSocialWallets).mockResolvedValue({
        data: [],
        error: null,
      });
      vi.mocked(getArtistAddresses).mockResolvedValue({
        data: [],
        error: null,
      } as never);

      const thread = makeThread();
      await handleMe(thread as never, ARTIST_ADDRESS);

      expect(thread.post).toHaveBeenCalledWith(
        'No email address linked to your account.'
      );
    });
  });

  describe('error handling', () => {
    it('rethrows on selectSocialWallets error', async () => {
      vi.mocked(selectSocialWallets).mockResolvedValue({
        data: null,
        error: { message: 'db down' } as never,
      });

      const thread = makeThread();
      await expect(handleMe(thread as never, ARTIST_ADDRESS)).rejects.toEqual({
        message: 'db down',
      });
    });

    it('rethrows on getArtistAddresses error', async () => {
      vi.mocked(selectSocialWallets).mockResolvedValue({
        data: [],
        error: null,
      });
      vi.mocked(getArtistAddresses).mockResolvedValue({
        data: null,
        error: { message: 'lookup failed' } as never,
      } as never);

      const thread = makeThread();
      await expect(handleMe(thread as never, ARTIST_ADDRESS)).rejects.toEqual({
        message: 'lookup failed',
      });
    });
  });
});
