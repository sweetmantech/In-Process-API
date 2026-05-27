import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/supabase/in_process_wallets/selectWallets', () => ({
  default: vi.fn(),
}));
vi.mock('@/lib/supabase/in_process_wallets/upsertWallets', () => ({
  default: vi.fn(),
}));
vi.mock('@/lib/artists/migrateProfile', () => ({
  default: vi.fn(),
}));
vi.mock('@/lib/coinbase/getOrCreateSmartWallet', () => ({
  getOrCreateSmartWallet: vi.fn(),
}));
vi.mock('@/lib/moment/migrateMoments', () => ({
  default: vi.fn(),
}));
vi.mock('@/lib/artists/migrateSmartWalletFunds', () => ({
  default: vi.fn(),
}));

import selectWallets from '@/lib/supabase/in_process_wallets/selectWallets';
import upsertWallets from '@/lib/supabase/in_process_wallets/upsertWallets';
import migrateProfile from '@/lib/artists/migrateProfile';
import { getOrCreateSmartWallet } from '@/lib/coinbase/getOrCreateSmartWallet';
import migrateMoments from '@/lib/moment/migrateMoments';
import migrateSmartWalletFunds from '@/lib/artists/migrateSmartWalletFunds';
import connectArtistWalletHandler from '@/lib/artists/connectArtistWalletHandler';

const ARTIST_WALLET = '0xa123456789012345678901234567890123456789' as const;
const SOCIAL_WALLET = '0xb234567890123456789012345678901234567891' as const;
const ARTIST_UUID = 'uuid-artist-1234';
const SMART = '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';

describe('connectArtistWalletHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(migrateProfile).mockResolvedValue(undefined);
    vi.mocked(getOrCreateSmartWallet).mockResolvedValue({
      address: SMART,
    } as any);
    vi.mocked(migrateMoments).mockResolvedValue(undefined);
    vi.mocked(migrateSmartWalletFunds).mockResolvedValue(undefined);
    vi.mocked(upsertWallets).mockResolvedValue(undefined);
    vi.mocked(selectWallets)
      .mockResolvedValueOnce({
        data: [{ artist_id: ARTIST_UUID }],
        error: null,
      } as any)
      .mockResolvedValueOnce({ data: [], error: null } as any);
  });

  it('returns success when wallet is connected', async () => {
    const res = await connectArtistWalletHandler({
      artist_wallet: ARTIST_WALLET,
      social_wallet: SOCIAL_WALLET,
    });
    const json = await res.json();

    expect(getOrCreateSmartWallet).toHaveBeenCalledWith({
      address: ARTIST_WALLET,
    });
    expect(migrateProfile).toHaveBeenCalledWith({
      social_wallet: SOCIAL_WALLET,
      artist_wallet: ARTIST_WALLET,
    });
    expect(migrateMoments).toHaveBeenCalledTimes(1);
    expect(migrateSmartWalletFunds).toHaveBeenCalledWith({
      socialSmartAccount: { address: SMART },
      artistSmartWalletAddress: SMART,
    });
    expect(upsertWallets).toHaveBeenCalledWith([
      {
        address: SOCIAL_WALLET.toLowerCase(),
        artist: ARTIST_UUID,
        type: 'privy',
      },
    ]);
    expect(json).toEqual({ success: true });
  });

  it('lowercases social_wallet address when upserting', async () => {
    await connectArtistWalletHandler({
      artist_wallet: ARTIST_WALLET,
      social_wallet: '0xB234567890123456789012345678901234567891' as any,
    });

    expect(upsertWallets).toHaveBeenCalledWith([
      expect.objectContaining({
        address: '0xb234567890123456789012345678901234567891',
      }),
    ]);
  });

  it('runs profile, moments, funds before upsert', async () => {
    const order: string[] = [];
    vi.mocked(migrateProfile).mockImplementation(async () => {
      order.push('profile');
    });
    vi.mocked(migrateMoments).mockImplementation(async () => {
      order.push('moments');
    });
    vi.mocked(migrateSmartWalletFunds).mockImplementation(async () => {
      order.push('funds');
    });
    vi.mocked(upsertWallets).mockImplementation(async () => {
      order.push('upsert');
    });

    await connectArtistWalletHandler({
      artist_wallet: ARTIST_WALLET,
      social_wallet: SOCIAL_WALLET,
    });

    expect(order).toEqual(['profile', 'moments', 'funds', 'upsert']);
  });

  it('throws when artist wallet not found in DB', async () => {
    vi.mocked(selectWallets).mockReset();
    vi.mocked(selectWallets).mockResolvedValue({
      data: [],
      error: null,
    } as any);

    await expect(
      connectArtistWalletHandler({
        artist_wallet: ARTIST_WALLET,
        social_wallet: SOCIAL_WALLET,
      })
    ).rejects.toThrow('Artist wallet not found');
  });

  it('throws when social wallet is already connected to a different artist', async () => {
    vi.mocked(selectWallets).mockReset();
    vi.mocked(selectWallets)
      .mockResolvedValueOnce({
        data: [{ artist_id: ARTIST_UUID }],
        error: null,
      } as any)
      .mockResolvedValueOnce({
        data: [{ artist_id: 'another-uuid' }],
        error: null,
      } as any);

    await expect(
      connectArtistWalletHandler({
        artist_wallet: ARTIST_WALLET,
        social_wallet: SOCIAL_WALLET,
      })
    ).rejects.toThrow('social_wallet is connected already.');
  });
});
