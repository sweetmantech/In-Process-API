import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CHAIN_ID } from '@/lib/consts';

vi.mock(
  '@/lib/supabase/in_process_artist_social_wallets/insertSocialWallet',
  () => ({ insertSocialWallet: vi.fn() })
);
vi.mock('@/lib/supabase/in_process_api_keys/getApiKeys', () => ({
  getApiKeys: vi.fn(),
}));
vi.mock('@/lib/supabase/in_process_api_keys/updateArtistAddress', () => ({
  updateArtistAddress: vi.fn(),
}));
vi.mock('@/lib/artists/migrateProfile', () => ({
  default: vi.fn(),
}));
vi.mock('@/lib/coinbase/getOrCreateSmartWallet', () => ({
  getOrCreateSmartWallet: vi.fn(),
}));
vi.mock('@/lib/supabase/in_process_collections/selectCollections', () => ({
  default: vi.fn(),
}));
vi.mock('@/lib/moment/migrateMoments', () => ({
  default: vi.fn(),
}));

import { insertSocialWallet } from '@/lib/supabase/in_process_artist_social_wallets/insertSocialWallet';
import { getApiKeys } from '@/lib/supabase/in_process_api_keys/getApiKeys';
import { updateArtistAddress } from '@/lib/supabase/in_process_api_keys/updateArtistAddress';
import migrateProfile from '@/lib/artists/migrateProfile';
import { getOrCreateSmartWallet } from '@/lib/coinbase/getOrCreateSmartWallet';
import selectCollections from '@/lib/supabase/in_process_collections/selectCollections';
import migrateMoments from '@/lib/moment/migrateMoments';
import connectArtistWalletHandler from '@/lib/artists/connectArtistWalletHandler';

describe('connectArtistWalletHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(migrateProfile).mockResolvedValue(undefined);
    vi.mocked(getApiKeys).mockResolvedValue({ data: [], error: null } as any);
    vi.mocked(updateArtistAddress).mockResolvedValue({ error: null } as any);
    vi.mocked(getOrCreateSmartWallet).mockResolvedValue({
      address: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    } as any);
    vi.mocked(selectCollections).mockResolvedValue({
      data: [],
      count: 0,
      error: null,
    } as any);
    vi.mocked(migrateMoments).mockResolvedValue(null);
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
    expect(selectCollections).toHaveBeenCalledWith({
      artists: ['0xb234567890123456789012345678901234567891'],
      chainId: CHAIN_ID,
    });
    expect(migrateMoments).not.toHaveBeenCalled();
    expect(json).toEqual({ success: true });
  });

  it('lowercases artist and social wallet before insertSocialWallet', async () => {
    vi.mocked(insertSocialWallet).mockResolvedValue({ error: null } as any);
    vi.mocked(getApiKeys).mockResolvedValue({
      data: [{ id: 'key-1' } as any],
      error: null,
    } as any);

    await connectArtistWalletHandler({
      artist_wallet: '0xA123456789012345678901234567890123456789',
      social_wallet: '0xB234567890123456789012345678901234567891',
    });

    expect(migrateProfile).toHaveBeenCalledWith({
      social_wallet: '0xb234567890123456789012345678901234567891',
      artist_wallet: '0xa123456789012345678901234567890123456789',
    });
    expect(updateArtistAddress).toHaveBeenCalledWith(
      'key-1',
      '0xa123456789012345678901234567890123456789'
    );
    expect(insertSocialWallet).toHaveBeenCalledWith({
      artist_address: '0xa123456789012345678901234567890123456789',
      social_wallet: '0xb234567890123456789012345678901234567891',
    });
  });

  it('calls migrateMoments when social wallet has collections', async () => {
    vi.mocked(insertSocialWallet).mockResolvedValue({ error: null } as any);
    const collections = [
      {
        address: '0x1111111111111111111111111111111111111111',
        admins: [
          {
            artist_address: '0xffffffffffffffffffffffffffffffffffffffff',
            token_id: 0,
          },
        ],
      },
    ];
    vi.mocked(selectCollections).mockResolvedValue({
      data: collections as any,
      count: 1,
      error: null,
    } as any);

    await connectArtistWalletHandler({
      artist_wallet: '0xA123456789012345678901234567890123456789',
      social_wallet: '0xb234567890123456789012345678901234567891',
    });

    expect(migrateMoments).toHaveBeenCalledTimes(1);
    expect(migrateMoments).toHaveBeenCalledWith({
      collections,
      socialWallet: '0xb234567890123456789012345678901234567891',
      artistWallet: {
        address: '0xa123456789012345678901234567890123456789',
        smartWalletAddress: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
      },
      chainId: CHAIN_ID,
    });
  });

  it('does not migrate when collection query errors', async () => {
    vi.mocked(insertSocialWallet).mockResolvedValue({ error: null } as any);
    vi.mocked(selectCollections).mockResolvedValue({
      data: null,
      count: null,
      error: { message: 'db failed' },
    } as any);

    const res = await connectArtistWalletHandler({
      artist_wallet: '0xa123456789012345678901234567890123456789',
      social_wallet: '0xb234567890123456789012345678901234567891',
    });

    expect(migrateMoments).not.toHaveBeenCalled();
    expect(await res.json()).toEqual({ success: true });
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
