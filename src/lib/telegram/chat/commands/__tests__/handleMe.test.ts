import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Address } from 'viem';

vi.mock('@/lib/supabase/in_process_artists/selectArtists', () => ({
  default: vi.fn(),
}));
vi.mock('@/lib/supabase/in_process_wallets/selectWallets', () => ({
  default: vi.fn(),
}));
vi.mock('@/lib/privy/getEmailByWalletAddress', () => ({ default: vi.fn() }));

import selectArtists from '@/lib/supabase/in_process_artists/selectArtists';
import selectWallets from '@/lib/supabase/in_process_wallets/selectWallets';
import getEmailByWalletAddress from '@/lib/privy/getEmailByWalletAddress';
import handleMe from '../handleMe';

const ARTIST_ADDRESS = '0xartist' as Address;
const ARTIST_UUID = 'uuid-artist-1234';
const SOCIAL_WALLET = '0xsocial' as Address;

const makeThread = () => ({
  post: vi.fn().mockResolvedValue(undefined),
  channelId: 'telegram:7',
});

beforeEach(() => {
  vi.resetAllMocks();
});

describe('handleMe', () => {
  describe('artistAddress has a known artist record', () => {
    it('posts the linked email found via privy wallet', async () => {
      vi.mocked(selectArtists).mockResolvedValue({
        data: [{ id: ARTIST_UUID }],
        error: null,
      } as any);
      vi.mocked(selectWallets)
        .mockResolvedValueOnce({
          data: [{ address: SOCIAL_WALLET }],
          error: null,
        } as any)
        .mockResolvedValueOnce({ data: [], error: null } as any);
      vi.mocked(getEmailByWalletAddress).mockResolvedValue('user@example.com');

      const thread = makeThread();
      await handleMe(thread as never, ARTIST_ADDRESS);

      expect(selectArtists).toHaveBeenCalledWith({ address: ARTIST_ADDRESS });
      expect(selectWallets).toHaveBeenCalledWith({
        artistIds: [ARTIST_UUID],
        type: 'privy',
      });
      expect(getEmailByWalletAddress).toHaveBeenCalledWith(SOCIAL_WALLET);
      expect(thread.post).toHaveBeenCalledWith(
        'Your linked email: user@example.com'
      );
    });

    it('tries each privy wallet and returns the first email found', async () => {
      vi.mocked(selectArtists).mockResolvedValue({
        data: [{ id: ARTIST_UUID }],
        error: null,
      } as any);
      vi.mocked(selectWallets).mockResolvedValueOnce({
        data: [{ address: '0xsocial1' }, { address: '0xsocial2' }],
        error: null,
      } as any);
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

    it('falls through to direct address check when no privy wallet has an email', async () => {
      vi.mocked(selectArtists).mockResolvedValue({
        data: [{ id: ARTIST_UUID }],
        error: null,
      } as any);
      vi.mocked(selectWallets)
        .mockResolvedValueOnce({
          data: [{ address: SOCIAL_WALLET }],
          error: null,
        } as any)
        .mockResolvedValueOnce({
          data: [{ type: 'privy' }],
          error: null,
        } as any);
      vi.mocked(getEmailByWalletAddress).mockResolvedValue(null);

      const thread = makeThread();
      await handleMe(thread as never, ARTIST_ADDRESS);

      expect(selectWallets).toHaveBeenCalledWith({
        addresses: [ARTIST_ADDRESS],
      });
      expect(thread.post).toHaveBeenCalledWith(
        'No email address linked to your account.'
      );
    });
  });

  describe('artistAddress is itself a privy wallet', () => {
    it('posts the email found directly from the privy wallet address', async () => {
      vi.mocked(selectArtists).mockResolvedValue({
        data: [],
        error: null,
      } as any);
      vi.mocked(selectWallets).mockResolvedValue({
        data: [{ type: 'privy' }],
        error: null,
      } as any);
      vi.mocked(getEmailByWalletAddress).mockResolvedValue(
        'social@example.com'
      );

      const thread = makeThread();
      await handleMe(thread as never, ARTIST_ADDRESS);

      expect(selectWallets).toHaveBeenCalledWith({
        addresses: [ARTIST_ADDRESS],
      });
      expect(getEmailByWalletAddress).toHaveBeenCalledWith(ARTIST_ADDRESS);
      expect(thread.post).toHaveBeenCalledWith(
        'Your linked email: social@example.com'
      );
    });

    it('posts no email message when privy wallet has no email', async () => {
      vi.mocked(selectArtists).mockResolvedValue({
        data: [],
        error: null,
      } as any);
      vi.mocked(selectWallets).mockResolvedValue({
        data: [{ type: 'privy' }],
        error: null,
      } as any);
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
      vi.mocked(selectArtists).mockResolvedValue({
        data: [],
        error: null,
      } as any);
      vi.mocked(selectWallets).mockResolvedValue({
        data: [],
        error: null,
      } as any);

      const thread = makeThread();
      await handleMe(thread as never, ARTIST_ADDRESS);

      expect(thread.post).toHaveBeenCalledWith(
        'No email address linked to your account.'
      );
    });
  });

  describe('error handling', () => {
    it('rethrows on selectArtists error', async () => {
      vi.mocked(selectArtists).mockRejectedValue(new Error('db down'));

      const thread = makeThread();
      await expect(handleMe(thread as never, ARTIST_ADDRESS)).rejects.toThrow(
        'db down'
      );
    });

    it('rethrows on selectWallets error', async () => {
      vi.mocked(selectArtists).mockResolvedValue({
        data: [{ id: ARTIST_UUID }],
        error: null,
      } as any);
      vi.mocked(selectWallets).mockRejectedValue(new Error('lookup failed'));

      const thread = makeThread();
      await expect(handleMe(thread as never, ARTIST_ADDRESS)).rejects.toThrow(
        'lookup failed'
      );
    });
  });
});
