import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/supabase/client', () => ({
  supabase: { rpc: vi.fn() },
}));

import { supabase } from '@/lib/supabase/client';
import getArtistsCollectorsStats from '@/lib/supabase/in_process_artists/getArtistsCollectorsStats';

const makeRow = (overrides = {}) => ({
  artist_id: 'uuid-artist',
  username: 'alice',
  wallets: [{ address: '0xartist', type: 'smart' }],
  total_created_count: 10,
  total_collected_count: 5,
  total_count: 1,
  ...overrides,
});

describe('getArtistsCollectorsStats', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls rpc with correct params and returns data', async () => {
    vi.mocked(supabase.rpc).mockResolvedValue({
      data: [makeRow()],
      error: null,
    } as any);

    const result = await getArtistsCollectorsStats({
      period: 'week',
      limit: 10,
      page: 2,
      artist: 'alice',
      sort_by: 'total_collected_count',
      sort_order: 'asc',
    });

    expect(supabase.rpc).toHaveBeenCalledWith('get_artists_collectors_stats', {
      p_period: 'week',
      p_limit: 10,
      p_page: 2,
      p_artist: 'alice',
      p_sort_by: 'total_collected_count',
      p_sort_order: 'asc',
    });

    expect(result.data).toHaveLength(1);
    expect(result.totalCount).toBe(1);
  });

  it('uses defaults when params are omitted', async () => {
    vi.mocked(supabase.rpc).mockResolvedValue({
      data: [],
      error: null,
    } as any);

    await getArtistsCollectorsStats({});

    expect(supabase.rpc).toHaveBeenCalledWith('get_artists_collectors_stats', {
      p_period: 'all',
      p_limit: 20,
      p_page: 1,
      p_artist: undefined,
      p_sort_by: 'total_created_count',
      p_sort_order: 'desc',
    });
  });

  it('extracts totalCount from first row total_count', async () => {
    vi.mocked(supabase.rpc).mockResolvedValue({
      data: [makeRow({ total_count: 99 }), makeRow({ total_count: 99 })],
      error: null,
    } as any);

    const result = await getArtistsCollectorsStats({});

    expect(result.totalCount).toBe(99);
  });

  it('returns totalCount 0 when data is empty', async () => {
    vi.mocked(supabase.rpc).mockResolvedValue({
      data: [],
      error: null,
    } as any);

    const result = await getArtistsCollectorsStats({});

    expect(result.totalCount).toBe(0);
    expect(result.data).toEqual([]);
  });

  it('passes undefined for artist when not provided', async () => {
    vi.mocked(supabase.rpc).mockResolvedValue({
      data: [],
      error: null,
    } as any);

    await getArtistsCollectorsStats({ artist: undefined });

    expect(supabase.rpc).toHaveBeenCalledWith(
      'get_artists_collectors_stats',
      expect.objectContaining({ p_artist: undefined })
    );
  });

  it('throws when supabase returns an error', async () => {
    vi.mocked(supabase.rpc).mockResolvedValue({
      data: null,
      error: { message: 'rpc error' },
    } as any);

    await expect(getArtistsCollectorsStats({})).rejects.toMatchObject({
      message: 'rpc error',
    });
  });
});
