import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/supabase/in_process_api_keys/getApiKeys', () => ({
  getApiKeys: vi.fn(),
}));
vi.mock('@/lib/supabase/in_process_wallets/selectWallets', () => ({
  default: vi.fn(),
}));

import { getApiKeys } from '@/lib/supabase/in_process_api_keys/getApiKeys';
import selectWallets from '@/lib/supabase/in_process_wallets/selectWallets';
import getArtistApiKeysHandler from '@/lib/artists/getArtistApiKeysHandler';

const ARTIST_ADDRESS = '0xa123456789012345678901234567890123456789';
const ARTIST_UUID = '00000000-0000-0000-0000-000000000001';

describe('getArtistApiKeysHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns keys from supabase keyed by artist UUID', async () => {
    vi.mocked(selectWallets).mockResolvedValue({
      data: [{ artist: ARTIST_UUID }],
      error: null,
    } as any);
    const rows = [{ id: '1', name: 'a', created_at: 't' }];
    vi.mocked(getApiKeys).mockResolvedValue(rows as any);

    const res = await getArtistApiKeysHandler(ARTIST_ADDRESS);
    const json = await res.json();

    expect(selectWallets).toHaveBeenCalledWith({ addresses: [ARTIST_ADDRESS] });
    expect(getApiKeys).toHaveBeenCalledWith({ artistId: ARTIST_UUID });
    expect(json).toEqual({ keys: rows });
  });

  it('returns empty list when wallet is not linked to an artist', async () => {
    vi.mocked(selectWallets).mockResolvedValue({
      data: [{ artist: null }],
      error: null,
    } as any);
    vi.mocked(getApiKeys).mockResolvedValue([]);

    const res = await getArtistApiKeysHandler(ARTIST_ADDRESS);
    const json = await res.json();

    expect(getApiKeys).toHaveBeenCalledWith({ artistId: null });
    expect(json).toEqual({ keys: [] });
  });

  it('propagates errors from getApiKeys', async () => {
    vi.mocked(selectWallets).mockResolvedValue({
      data: [{ artist: ARTIST_UUID }],
      error: null,
    } as any);
    vi.mocked(getApiKeys).mockRejectedValue(new Error('db'));

    await expect(getArtistApiKeysHandler(ARTIST_ADDRESS)).rejects.toThrow('db');
  });
});
