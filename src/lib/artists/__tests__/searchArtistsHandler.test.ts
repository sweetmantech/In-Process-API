import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/supabase/in_process_artists/selectArtists', () => ({
  default: vi.fn(),
}));

import selectArtists from '@/lib/supabase/in_process_artists/selectArtists';
import searchArtistsHandler from '@/lib/artists/searchArtistsHandler';

const WALLETS_1 = [{ address: '0xartist1', type: 'external' }];
const WALLETS_2 = [{ address: '0xartist2', type: 'privy' }];

describe('searchArtistsHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns mapped artists with username and wallets fields', async () => {
    vi.mocked(selectArtists).mockResolvedValue({
      data: [
        { username: 'alice', wallets: WALLETS_1 },
        { username: 'alice2', wallets: WALLETS_2 },
      ],
      count: 2,
      error: null,
    } as any);

    const res = await searchArtistsHandler('alice', 10);
    const json = await res.json();

    expect(json).toEqual({
      artists: [
        { username: 'alice', wallets: WALLETS_1 },
        { username: 'alice2', wallets: WALLETS_2 },
      ],
    });
  });

  it('passes query and limit to selectArtists', async () => {
    vi.mocked(selectArtists).mockResolvedValue({
      data: [],
      count: 0,
      error: null,
    } as any);

    await searchArtistsHandler('bob', 25);

    expect(selectArtists).toHaveBeenCalledWith({ q: 'bob', limit: 25 });
  });

  it('returns an empty artists array when no matches are found', async () => {
    vi.mocked(selectArtists).mockResolvedValue({
      data: [],
      count: 0,
      error: null,
    } as any);

    const res = await searchArtistsHandler('nobody', 10);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json).toEqual({ artists: [] });
  });

  it('returns an empty artists array when data is null', async () => {
    vi.mocked(selectArtists).mockResolvedValue({
      data: null,
      count: null,
      error: null,
    } as any);

    const res = await searchArtistsHandler('ghost', 10);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json).toEqual({ artists: [] });
  });

  it('throws when supabase returns an error', async () => {
    vi.mocked(selectArtists).mockRejectedValue(new Error('DB failure'));

    await expect(searchArtistsHandler('alice', 10)).rejects.toThrow(
      'DB failure'
    );
  });
});
