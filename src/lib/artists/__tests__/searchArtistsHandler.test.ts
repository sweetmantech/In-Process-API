import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/supabase/in_process_artists/selectArtists', () => ({
  default: vi.fn(),
}));

import selectArtists from '@/lib/supabase/in_process_artists/selectArtists';
import searchArtistsHandler from '@/lib/artists/searchArtistsHandler';

describe('searchArtistsHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns mapped artists with only address and username fields', async () => {
    vi.mocked(selectArtists).mockResolvedValue({
      data: [
        {
          address: '0xartist1',
          username: 'alice',
          telegram_username: 'aliceTg',
          smart_wallet: '0xsmart1',
        },
        {
          address: '0xartist2',
          username: 'alice2',
          email: 'a@b.com',
        },
      ],
      count: 2,
      error: null,
    } as any);

    const res = await searchArtistsHandler('alice', 10);
    const json = await res.json();

    expect(json).toEqual({
      artists: [
        { address: '0xartist1', username: 'alice' },
        { address: '0xartist2', username: 'alice2' },
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
    vi.mocked(selectArtists).mockResolvedValue({
      data: null,
      count: null,
      error: { message: 'DB failure' },
    } as any);

    await expect(searchArtistsHandler('alice', 10)).rejects.toThrow(
      'DB failure'
    );
  });
});
