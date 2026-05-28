import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/supabase/in_process_api_keys/getApiKeys', () => ({
  getApiKeys: vi.fn(),
}));

import { getApiKeys } from '@/lib/supabase/in_process_api_keys/getApiKeys';
import getArtistApiKeysHandler from '@/lib/artists/getArtistApiKeysHandler';

const ARTIST_UUID = '00000000-0000-0000-0000-000000000001';

describe('getArtistApiKeysHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns keys from supabase keyed by artist UUID', async () => {
    const rows = [{ id: '1', name: 'a', created_at: 't' }];
    vi.mocked(getApiKeys).mockResolvedValue(rows as any);

    const res = await getArtistApiKeysHandler({ artistId: ARTIST_UUID });
    const json = await res.json();

    expect(getApiKeys).toHaveBeenCalledWith({ artistId: ARTIST_UUID });
    expect(json).toEqual({ keys: rows });
  });

  it('returns empty list when no keys exist', async () => {
    vi.mocked(getApiKeys).mockResolvedValue([]);

    const res = await getArtistApiKeysHandler({ artistId: ARTIST_UUID });
    const json = await res.json();

    expect(json).toEqual({ keys: [] });
  });

  it('propagates errors from getApiKeys', async () => {
    vi.mocked(getApiKeys).mockRejectedValue(new Error('db'));

    await expect(
      getArtistApiKeysHandler({ artistId: ARTIST_UUID })
    ).rejects.toThrow('db');
  });
});
