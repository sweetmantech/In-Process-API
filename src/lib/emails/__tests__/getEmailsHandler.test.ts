import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextResponse } from 'next/server';

vi.mock('@/lib/consts', () => ({
  ADMIN_ADDRESSES: ['0xaf1452d289e22fbd0dea9d5097353c72a90fac33'],
}));

vi.mock(
  '@/lib/supabase/in_process_artist_social_wallets/selectSocialWallets',
  () => ({
    selectSocialWallets: vi.fn(),
  })
);

vi.mock('@/lib/privy/getEmailByWalletAddress', () => ({
  default: vi.fn(),
}));

vi.mock('@/lib/privy/getAllEmails', () => ({
  default: vi.fn(),
}));

vi.mock(
  '@/lib/supabase/in_process_artist_social_wallets/getArtistAddresses',
  () => ({
    default: vi.fn(),
  })
);

import { selectSocialWallets } from '@/lib/supabase/in_process_artist_social_wallets/selectSocialWallets';
import getEmailByWalletAddress from '@/lib/privy/getEmailByWalletAddress';
import getAllEmails from '@/lib/privy/getAllEmails';
import getArtistAddresses from '@/lib/supabase/in_process_artist_social_wallets/getArtistAddresses';
import getEmailsHandler from '@/lib/emails/getEmailsHandler';

const ADMIN_ADDRESS = '0xaf1452d289e22fbd0dea9d5097353c72a90fac33';
const NON_ADMIN_ADDRESS = '0x0000000000000000000000000000000000000001';
const OTHER_ADDRESS = '0x0000000000000000000000000000000000000002';

describe('getEmailsHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('non-admin (normal API key)', () => {
    it('returns own email using callerAddress', async () => {
      vi.mocked(selectSocialWallets).mockResolvedValue({
        data: [{ social_wallet: '0xsocialwallet' }],
        error: null,
      } as any);
      vi.mocked(getEmailByWalletAddress).mockResolvedValue(
        'artist@example.com'
      );

      const res = await getEmailsHandler(NON_ADMIN_ADDRESS);
      const json = await res.json();

      expect(json).toEqual({ email: 'artist@example.com' });
      expect(selectSocialWallets).toHaveBeenCalledWith({
        artistAddress: NON_ADMIN_ADDRESS,
      });
    });

    it('returns null email when no social wallet found', async () => {
      vi.mocked(selectSocialWallets).mockResolvedValue({
        data: [],
        error: null,
      } as any);

      const res = await getEmailsHandler(NON_ADMIN_ADDRESS);
      const json = await res.json();

      expect(json).toEqual({ email: null });
      expect(getEmailByWalletAddress).not.toHaveBeenCalled();
    });

    it('ignores artist_address param and returns own email', async () => {
      vi.mocked(selectSocialWallets).mockResolvedValue({
        data: [{ social_wallet: '0xsocialwallet' }],
        error: null,
      } as any);
      vi.mocked(getEmailByWalletAddress).mockResolvedValue('own@example.com');

      const res = await getEmailsHandler(NON_ADMIN_ADDRESS, OTHER_ADDRESS);
      const json = await res.json();

      expect(json).toEqual({ email: 'own@example.com' });
      expect(selectSocialWallets).toHaveBeenCalledWith({
        artistAddress: NON_ADMIN_ADDRESS,
      });
    });
  });

  describe('admin with artist_address', () => {
    it('returns email for specified artist', async () => {
      vi.mocked(selectSocialWallets).mockResolvedValue({
        data: [{ social_wallet: '0xsocialwallet' }],
        error: null,
      } as any);
      vi.mocked(getEmailByWalletAddress).mockResolvedValue(
        'artist@example.com'
      );

      const res = await getEmailsHandler(ADMIN_ADDRESS, OTHER_ADDRESS);
      const json = await res.json();

      expect(json).toEqual({ email: 'artist@example.com' });
      expect(selectSocialWallets).toHaveBeenCalledWith({
        artistAddress: OTHER_ADDRESS,
      });
    });

    it('returns null email when no social wallet found', async () => {
      vi.mocked(selectSocialWallets).mockResolvedValue({
        data: [],
        error: null,
      } as any);

      const res = await getEmailsHandler(ADMIN_ADDRESS, OTHER_ADDRESS);
      const json = await res.json();

      expect(json).toEqual({ email: null });
      expect(getEmailByWalletAddress).not.toHaveBeenCalled();
    });
  });

  describe('admin list (no artistAddress)', () => {
    it('returns enriched emails with artist_address and username', async () => {
      vi.mocked(getAllEmails).mockResolvedValue({
        emails: [{ address: '0xsocial', email: 'user@example.com' }],
        next_cursor: null,
      } as any);
      vi.mocked(getArtistAddresses).mockResolvedValue({
        data: [
          {
            social_wallet: '0xsocial',
            artist_address: '0xartist',
            in_process_artists: { username: 'coolartist' },
          },
        ],
        error: null,
      } as any);

      const res = await getEmailsHandler(ADMIN_ADDRESS);
      const json = await res.json();

      expect(json.emails).toEqual([
        {
          address: '0xsocial',
          email: 'user@example.com',
          artist_address: '0xartist',
          username: 'coolartist',
        },
      ]);
      expect(json.next_cursor).toBeNull();
    });

    it('returns null artist_address and username when no match in supabase', async () => {
      vi.mocked(getAllEmails).mockResolvedValue({
        emails: [{ address: '0xunknown', email: 'unknown@example.com' }],
        next_cursor: null,
      } as any);
      vi.mocked(getArtistAddresses).mockResolvedValue({
        data: [],
        error: null,
      } as any);

      const res = await getEmailsHandler(ADMIN_ADDRESS);
      const json = await res.json();

      expect(json.emails).toEqual([
        {
          address: '0xunknown',
          email: 'unknown@example.com',
          artist_address: null,
          username: null,
        },
      ]);
    });

    it('returns null username when artist has no username', async () => {
      vi.mocked(getAllEmails).mockResolvedValue({
        emails: [{ address: '0xsocial', email: 'user@example.com' }],
        next_cursor: null,
      } as any);
      vi.mocked(getArtistAddresses).mockResolvedValue({
        data: [
          {
            social_wallet: '0xsocial',
            artist_address: '0xartist',
            in_process_artists: null,
          },
        ],
        error: null,
      } as any);

      const res = await getEmailsHandler(ADMIN_ADDRESS);
      const json = await res.json();

      expect(json.emails[0].username).toBeNull();
    });

    it('throws when getArtistAddresses returns an error', async () => {
      vi.mocked(getAllEmails).mockResolvedValue({
        emails: [{ address: '0xsocial', email: 'user@example.com' }],
        next_cursor: null,
      } as any);
      vi.mocked(getArtistAddresses).mockResolvedValue({
        data: null,
        error: { message: 'DB connection failed' },
      } as any);

      await expect(getEmailsHandler(ADMIN_ADDRESS)).rejects.toThrow(
        'DB connection failed'
      );
    });

    it('passes cursor and limit to getAllEmails', async () => {
      vi.mocked(getAllEmails).mockResolvedValue({
        emails: [],
        next_cursor: null,
      } as any);
      vi.mocked(getArtistAddresses).mockResolvedValue({
        data: [],
        error: null,
      } as any);

      await getEmailsHandler(ADMIN_ADDRESS, undefined, 'cursor-abc', 10);

      expect(getAllEmails).toHaveBeenCalledWith('cursor-abc', 10);
    });
  });
});
