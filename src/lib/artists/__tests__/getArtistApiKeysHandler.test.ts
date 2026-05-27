import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/supabase/in_process_api_keys/getApiKeys', () => ({
  getApiKeys: vi.fn(),
}));

const mocks = vi.hoisted(() => ({
  walletSelectSingle: vi.fn<
    (...args: unknown[]) => Promise<{ data?: unknown; error?: unknown }>
  >(),
}));

vi.mock('@/lib/supabase/client', () => ({
  supabase: {
    from: () => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => mocks.walletSelectSingle()),
        })),
      })),
    }),
  },
}));

import { getApiKeys } from '@/lib/supabase/in_process_api_keys/getApiKeys';
import getArtistApiKeysHandler from '@/lib/artists/getArtistApiKeysHandler';

const ARTIST_ADDRESS = '0xa123456789012345678901234567890123456789';
const ARTIST_UUID = '00000000-0000-0000-0000-000000000001';

describe('getArtistApiKeysHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns keys from supabase keyed by artist UUID', async () => {
    mocks.walletSelectSingle.mockResolvedValue({
      data: { artist: ARTIST_UUID },
      error: null,
    });
    const rows = [{ id: '1', name: 'a', created_at: 't' }];
    vi.mocked(getApiKeys).mockResolvedValue({ data: rows, error: null } as any);

    const res = await getArtistApiKeysHandler(ARTIST_ADDRESS);
    const json = await res.json();

    expect(getApiKeys).toHaveBeenCalledWith(ARTIST_UUID);
    expect(json).toEqual({ keys: rows });
  });

  it('returns empty list when wallet is not linked to an artist', async () => {
    mocks.walletSelectSingle.mockResolvedValue({
      data: { artist: null },
      error: null,
    });
    vi.mocked(getApiKeys).mockResolvedValue({ data: [], error: null } as any);

    const res = await getArtistApiKeysHandler(ARTIST_ADDRESS);
    const json = await res.json();

    expect(getApiKeys).toHaveBeenCalledWith(null);
    expect(json).toEqual({ keys: [] });
  });

  it('throws when getApiKeys returns error', async () => {
    mocks.walletSelectSingle.mockResolvedValue({
      data: { artist: ARTIST_UUID },
      error: null,
    });
    vi.mocked(getApiKeys).mockResolvedValue({
      data: null,
      error: { message: 'db' },
    } as any);

    await expect(getArtistApiKeysHandler(ARTIST_ADDRESS)).rejects.toThrow(
      'Failed to fetch API keys'
    );
  });
});
