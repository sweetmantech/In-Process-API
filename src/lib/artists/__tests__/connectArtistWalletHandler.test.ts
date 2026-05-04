import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock(
  '@/lib/supabase/in_process_artist_social_wallets/insertSocialWallet',
  () => ({ insertSocialWallet: vi.fn() })
);
vi.mock('@/lib/artists/migrateApiKey', () => ({
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

import { insertSocialWallet } from '@/lib/supabase/in_process_artist_social_wallets/insertSocialWallet';
import migrateApiKey from '@/lib/artists/migrateApiKey';
import migrateProfile from '@/lib/artists/migrateProfile';
import { getOrCreateSmartWallet } from '@/lib/coinbase/getOrCreateSmartWallet';
import migrateMoments from '@/lib/moment/migrateMoments';
import migrateSmartWalletFunds from '@/lib/artists/migrateSmartWalletFunds';
import connectArtistWalletHandler from '@/lib/artists/connectArtistWalletHandler';

describe('connectArtistWalletHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(migrateProfile).mockResolvedValue(undefined);
    vi.mocked(migrateApiKey).mockResolvedValue(undefined);
    vi.mocked(getOrCreateSmartWallet).mockResolvedValue({
      address: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    } as any);
    vi.mocked(migrateMoments).mockResolvedValue(null);
    vi.mocked(migrateSmartWalletFunds).mockResolvedValue(undefined);
  });

  it('returns success when wallet is connected', async () => {
    vi.mocked(insertSocialWallet).mockResolvedValue({ error: null } as any);

    const res = await connectArtistWalletHandler({
      artist_wallet: '0xa123456789012345678901234567890123456789',
      social_wallet: '0xb234567890123456789012345678901234567891',
    });
    const json = await res.json();

    expect(getOrCreateSmartWallet).toHaveBeenCalledWith({
      address: '0xa123456789012345678901234567890123456789',
    });
    expect(migrateProfile).toHaveBeenCalledWith({
      social_wallet: '0xb234567890123456789012345678901234567891',
      artist_wallet: '0xa123456789012345678901234567890123456789',
    });
    expect(migrateApiKey).toHaveBeenCalledWith({
      social_wallet: '0xb234567890123456789012345678901234567891',
      artist_wallet: '0xa123456789012345678901234567890123456789',
    });
    expect(migrateMoments).toHaveBeenCalledTimes(1);
    expect(migrateMoments).toHaveBeenCalledWith({
      socialWallet: {
        address: '0xb234567890123456789012345678901234567891',
        smartAccount: {
          address: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
        },
      },
      artistWallet: {
        address: '0xa123456789012345678901234567890123456789',
        smartWalletAddress: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
      },
    });
    expect(json).toEqual({ success: true });
  });

  it('forwards wallet casing from input to migrations and insertSocialWallet', async () => {
    vi.mocked(insertSocialWallet).mockResolvedValue({ error: null } as any);

    await connectArtistWalletHandler({
      artist_wallet: '0xA123456789012345678901234567890123456789',
      social_wallet: '0xB234567890123456789012345678901234567891',
    });

    expect(migrateProfile).toHaveBeenCalledWith({
      social_wallet: '0xB234567890123456789012345678901234567891',
      artist_wallet: '0xA123456789012345678901234567890123456789',
    });
    expect(migrateApiKey).toHaveBeenCalledWith({
      social_wallet: '0xB234567890123456789012345678901234567891',
      artist_wallet: '0xA123456789012345678901234567890123456789',
    });
    expect(insertSocialWallet).toHaveBeenCalledWith({
      artist_address: '0xA123456789012345678901234567890123456789',
      social_wallet: '0xB234567890123456789012345678901234567891',
    });
    expect(migrateMoments).toHaveBeenCalledWith({
      socialWallet: {
        address: '0xB234567890123456789012345678901234567891',
        smartAccount: {
          address: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
        },
      },
      artistWallet: {
        address: '0xA123456789012345678901234567890123456789',
        smartWalletAddress: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
      },
    });
  });

  it('runs profile migration before api key and moments', async () => {
    vi.mocked(insertSocialWallet).mockResolvedValue({ error: null } as any);
    const order: string[] = [];
    vi.mocked(migrateProfile).mockImplementation(async () => {
      order.push('profile');
    });
    vi.mocked(migrateApiKey).mockImplementation(async () => {
      order.push('apiKey');
    });
    vi.mocked(migrateMoments).mockImplementation(async () => {
      order.push('moments');
    });

    await connectArtistWalletHandler({
      artist_wallet: '0xa123456789012345678901234567890123456789',
      social_wallet: '0xb234567890123456789012345678901234567891',
    });

    expect(order).toEqual(['profile', 'apiKey', 'moments']);
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
