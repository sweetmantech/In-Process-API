import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/api-keys/generateApiKey', () => ({
  generateApiKey: vi.fn(() => 'art_sk_raw'),
}));
vi.mock('@/lib/api-keys/hashApiKey', () => ({
  hashApiKey: vi.fn(() => 'hashed'),
}));
vi.mock('@/lib/supabase/in_process_api_keys/insertApiKey', () => ({
  insertApiKey: vi.fn(),
}));

type FluentResult = { data?: unknown; error?: unknown };

const mocks = vi.hoisted(() => ({
  walletUpsert: vi.fn<(...args: unknown[]) => Promise<FluentResult>>(),
  walletSelectSingle: vi.fn<(...args: unknown[]) => Promise<FluentResult>>(),
  walletUpdate: vi.fn<(...args: unknown[]) => Promise<FluentResult>>(),
  artistInsertSingle: vi.fn<(...args: unknown[]) => Promise<FluentResult>>(),
}));

vi.mock('@/lib/supabase/client', () => ({
  supabase: {
    from: (table: string) => {
      if (table === 'in_process_wallets') {
        return {
          upsert: vi.fn(() => mocks.walletUpsert()),
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn(() => mocks.walletSelectSingle()),
            })),
          })),
          update: vi.fn(() => ({
            eq: vi.fn(() => ({
              is: vi.fn(() => mocks.walletUpdate()),
            })),
          })),
        };
      }
      if (table === 'in_process_artists') {
        return {
          insert: vi.fn(() => ({
            select: vi.fn(() => ({
              single: vi.fn(() => mocks.artistInsertSingle()),
            })),
          })),
        };
      }
      throw new Error(`Unexpected table: ${table}`);
    },
  },
}));

import { generateApiKey } from '@/lib/api-keys/generateApiKey';
import { hashApiKey } from '@/lib/api-keys/hashApiKey';
import { insertApiKey } from '@/lib/supabase/in_process_api_keys/insertApiKey';
import createArtistApiKeyHandler from '@/lib/artists/createArtistApiKeyHandler';
import { PRIVY_PROJECT_SECRET } from '@/lib/consts';

const ARTIST_ADDRESS = '0xA123456789012345678901234567890123456789';
const ARTIST_LC = ARTIST_ADDRESS.toLowerCase();
const ARTIST_UUID = '00000000-0000-0000-0000-000000000001';

describe('createArtistApiKeyHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.walletUpsert.mockResolvedValue({ error: null });
    mocks.walletUpdate.mockResolvedValue({ error: null });
    vi.mocked(insertApiKey).mockResolvedValue({ error: null } as any);
  });

  it('uses existing artist UUID when wallet is already linked', async () => {
    mocks.walletSelectSingle.mockResolvedValue({
      data: { artist: ARTIST_UUID },
      error: null,
    });

    const res = await createArtistApiKeyHandler({
      artistAddress: ARTIST_ADDRESS,
      key_name: '  prod  ',
    });
    const json = await res.json();

    expect(generateApiKey).toHaveBeenCalledWith('art_sk');
    expect(hashApiKey).toHaveBeenCalledWith('art_sk_raw', PRIVY_PROJECT_SECRET);
    expect(mocks.walletUpsert).toHaveBeenCalledTimes(1);
    expect(mocks.artistInsertSingle).not.toHaveBeenCalled();
    expect(insertApiKey).toHaveBeenCalledWith({
      name: 'prod',
      artist_id: ARTIST_UUID,
      key_hash: 'hashed',
    });
    expect(json).toEqual({ key: 'art_sk_raw' });
  });

  it('creates a new artist when the wallet has no link, then inserts key', async () => {
    mocks.walletSelectSingle.mockResolvedValue({
      data: { artist: null },
      error: null,
    });
    mocks.artistInsertSingle.mockResolvedValue({
      data: { id: ARTIST_UUID },
      error: null,
    });

    await createArtistApiKeyHandler({
      artistAddress: ARTIST_LC,
      key_name: 'n',
    });

    expect(mocks.artistInsertSingle).toHaveBeenCalledTimes(1);
    expect(mocks.walletUpdate).toHaveBeenCalledTimes(1);
    expect(insertApiKey).toHaveBeenCalledWith({
      name: 'n',
      artist_id: ARTIST_UUID,
      key_hash: 'hashed',
    });
  });

  it('throws when insertApiKey fails', async () => {
    mocks.walletSelectSingle.mockResolvedValue({
      data: { artist: ARTIST_UUID },
      error: null,
    });
    vi.mocked(insertApiKey).mockResolvedValue({
      error: { message: 'e' },
    } as any);

    await expect(
      createArtistApiKeyHandler({
        artistAddress: ARTIST_LC,
        key_name: 'n',
      })
    ).rejects.toThrow('Failed to store api key');
  });
});
