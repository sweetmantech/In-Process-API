import { describe, it, expect, vi, beforeEach } from 'vitest';
import { supabase } from '@/lib/supabase/client';
import getTimelineStats, { emptyTimelineStats } from '../getTimelineStats';

vi.mock('@/lib/supabase/client', () => ({
  supabase: { rpc: vi.fn() },
}));

const artist = '0xAbC0000000000000000000000000000000000001';

describe('getTimelineStats', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns created count and archived totals from the RPC', async () => {
    vi.mocked(supabase.rpc).mockResolvedValue({
      data: [
        {
          created_count: 12,
          eth_archived: '0.1',
          usdc_archived: '25',
        },
      ],
      error: null,
    } as never);

    await expect(getTimelineStats(artist)).resolves.toEqual({
      created_count: 12,
      eth_archived: '0.1',
      usdc_archived: '25',
    });

    expect(supabase.rpc).toHaveBeenCalledWith('get_timeline_stats', {
      p_artist: artist.toLowerCase(),
    });
  });

  it('returns empty stats when the RPC returns no rows', async () => {
    vi.mocked(supabase.rpc).mockResolvedValue({
      data: [],
      error: null,
    } as never);

    await expect(getTimelineStats(artist)).resolves.toEqual(emptyTimelineStats);
  });

  it('returns empty stats when the RPC fails', async () => {
    vi.mocked(supabase.rpc).mockResolvedValue({
      data: null,
      error: new Error('rpc failed'),
    } as never);

    await expect(getTimelineStats(artist)).resolves.toEqual(emptyTimelineStats);
  });
});
