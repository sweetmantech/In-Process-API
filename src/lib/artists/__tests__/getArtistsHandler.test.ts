import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/consts', () => ({
  ADMIN_ADDRESSES: ['0xadmin0000000000000000000000000000000000'],
}));

vi.mock('@/lib/supabase/in_process_artists/selectArtists', () => ({
  default: vi.fn(),
}));

import selectArtists from '@/lib/supabase/in_process_artists/selectArtists';
import getArtistsHandler from '@/lib/artists/getArtistsHandler';

const ADMIN = '0xadmin0000000000000000000000000000000000';
const NON_ADMIN = '0x0000000000000000000000000000000000000001';

describe('getArtistsHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 403 for non-admin callers', async () => {
    const res = await getArtistsHandler(NON_ADMIN, 'human');
    expect(res.status).toBe(403);
    const json = await res.json();
    expect(json).toEqual({ message: 'Forbidden' });
  });

  it('throws when supabase returns an error', async () => {
    vi.mocked(selectArtists).mockResolvedValue({
      data: null,
      count: null,
      error: { message: 'DB failure' },
    } as any);

    await expect(getArtistsHandler(ADMIN, 'human')).rejects.toThrow(
      'DB failure'
    );
  });

  it('returns artists with pagination including total', async () => {
    vi.mocked(selectArtists).mockResolvedValue({
      data: [{ address: '0xartist1' }, { address: '0xartist2' }],
      count: 120,
      error: null,
    } as any);

    const res = await getArtistsHandler(ADMIN, 'human');
    const json = await res.json();

    expect(json.status).toBe('success');
    expect(json.artists).toHaveLength(2);
    expect(json.pagination).toEqual({
      page: 1,
      limit: 50,
      total: 120,
      total_pages: 3,
    });
  });

  it('uses provided limit and page', async () => {
    vi.mocked(selectArtists).mockResolvedValue({
      data: [{ address: '0xartist1' }],
      count: 10,
      error: null,
    } as any);

    const res = await getArtistsHandler(ADMIN, 'human', 5, 2);
    const json = await res.json();

    expect(json.pagination).toEqual({
      page: 2,
      limit: 5,
      total: 10,
      total_pages: 2,
    });
    expect(selectArtists).toHaveBeenCalledWith({
      type: 'human',
      limit: 5,
      page: 2,
    });
  });

  it('total is 0 when count is null', async () => {
    vi.mocked(selectArtists).mockResolvedValue({
      data: [],
      count: null,
      error: null,
    } as any);

    const res = await getArtistsHandler(ADMIN, 'human');
    const json = await res.json();

    expect(json.pagination.total).toBe(0);
    expect(json.pagination.total_pages).toBe(0);
  });

  it('passes type=bot to selectArtists', async () => {
    vi.mocked(selectArtists).mockResolvedValue({
      data: [],
      count: 0,
      error: null,
    } as any);

    await getArtistsHandler(ADMIN, 'bot');

    expect(selectArtists).toHaveBeenCalledWith({
      type: 'bot',
      limit: 50,
      page: 1,
    });
  });
});
