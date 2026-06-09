import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/supabase/in_process_artists/getActiveArtistsStats', () => ({
  default: vi.fn(),
}));

import getActiveArtistsStats from '@/lib/supabase/in_process_artists/getActiveArtistsStats';
import getActiveArtistsHandler from '@/lib/artists/getActiveArtistsHandler';

const BASE_PARAMS = {
  period: 'all' as const,
  limit: 20,
  page: 1,
  artist: undefined as string | undefined,
  sort_by: 'created_count' as const,
  sort_order: 'desc' as const,
};

describe('getActiveArtistsHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns data with pagination metadata on success', async () => {
    vi.mocked(getActiveArtistsStats).mockResolvedValue({
      data: [
        {
          artist_id: 'uuid-artist',
          username: 'alice',
          wallets: [{ address: '0xartist', type: 'smart' }],
          created_count: 10,
          airdropped_count: 5,
          telegram_count: 2,
          web_count: 4,
          api_count: 3,
          sms_count: 1,
          total_count: 33,
        },
      ] as any,
      totalCount: 33,
    });

    const res = await getActiveArtistsHandler(BASE_PARAMS);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.artists).toHaveLength(1);
    expect(json.total_count).toBe(33);
    expect(json.page).toBe(1);
    expect(json.total_pages).toBe(2);
  });

  it('passes all params to getActiveArtistsStats', async () => {
    vi.mocked(getActiveArtistsStats).mockResolvedValue({
      data: [],
      totalCount: 0,
    });

    await getActiveArtistsHandler({
      period: 'week',
      limit: 10,
      page: 3,
      artist: 'alice',
      sort_by: 'telegram_count',
      sort_order: 'asc',
    });

    expect(getActiveArtistsStats).toHaveBeenCalledWith({
      period: 'week',
      limit: 10,
      page: 3,
      artist: 'alice',
      sort_by: 'telegram_count',
      sort_order: 'asc',
    });
  });

  it('returns total_pages as 0 when totalCount is 0', async () => {
    vi.mocked(getActiveArtistsStats).mockResolvedValue({
      data: [],
      totalCount: 0,
    });

    const res = await getActiveArtistsHandler(BASE_PARAMS);
    const json = await res.json();

    expect(json.total_count).toBe(0);
    expect(json.total_pages).toBe(0);
  });

  it('propagates error when getActiveArtistsStats throws', async () => {
    vi.mocked(getActiveArtistsStats).mockRejectedValue(new Error('DB failed'));

    await expect(getActiveArtistsHandler(BASE_PARAMS)).rejects.toThrow(
      'DB failed'
    );
  });
});
