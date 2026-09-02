import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('@/lib/supabase/client', () => ({
  supabase: { rpc: vi.fn() },
}));

import { supabase } from '@/lib/supabase/client';
import getAnalyticsStats from '@/lib/stats/getAnalyticsStats';
import validateAnalyticsStatsQuery from '@/lib/stats/validateAnalyticsStatsQuery';
import getAnalyticsStatsHandler from '@/lib/stats/getAnalyticsStatsHandler';

describe('getAnalyticsStats', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('maps rpc row to stats fields with delta_pct', async () => {
    vi.mocked(supabase.rpc).mockResolvedValue({
      data: [
        {
          moments_created: '54',
          moments_airdropped: 18,
          moments_collected: 32,
          active_artists: 17,
          collectors: 21,
          artists_collectors: 3,
          moments_created_prev: 46,
          moments_airdropped_prev: 17,
          moments_collected_prev: 30,
          active_artists_prev: 14,
          collectors_prev: 23,
          artists_collectors_prev: 2,
        },
      ],
      error: null,
    });

    const result = await getAnalyticsStats({ period: 'week' });

    expect(supabase.rpc).toHaveBeenCalledWith('get_analytics_stats', {
      p_period: 'week',
      p_artist: undefined,
    });
    expect(result).toEqual({
      period: 'week',
      moments_created: { value: 54, prev: 46, delta_pct: 17.4 },
      moments_airdropped: { value: 18, prev: 17, delta_pct: 5.9 },
      moments_collected: { value: 32, prev: 30, delta_pct: 6.7 },
      active_artists: { value: 17, prev: 14, delta_pct: 21.4 },
      collectors: { value: 21, prev: 23, delta_pct: -8.7 },
      artists_collectors: { value: 3, prev: 2, delta_pct: 50 },
    });
  });

  it('omits comparison fields for all-time stats', async () => {
    vi.mocked(supabase.rpc).mockResolvedValue({
      data: [
        {
          moments_created: 100,
          moments_airdropped: 20,
          moments_collected: 40,
          active_artists: 17,
          collectors: 21,
          artists_collectors: 3,
          moments_created_prev: null,
          moments_airdropped_prev: null,
          moments_collected_prev: null,
          active_artists_prev: null,
          collectors_prev: null,
          artists_collectors_prev: null,
        },
      ],
      error: null,
    });

    const result = await getAnalyticsStats({ period: 'all' });

    expect(result.moments_created).toEqual({
      value: 100,
      prev: null,
      delta_pct: null,
    });
    expect(result.collectors).toEqual({
      value: 21,
      prev: null,
      delta_pct: null,
    });
  });

  it('passes artist filter to rpc', async () => {
    vi.mocked(supabase.rpc).mockResolvedValue({
      data: [
        {
          moments_created: 1,
          moments_airdropped: 0,
          moments_collected: 0,
          active_artists: 1,
          collectors: 0,
          artists_collectors: 0,
          moments_created_prev: 0,
          moments_airdropped_prev: 0,
          moments_collected_prev: 0,
          active_artists_prev: 0,
          collectors_prev: 0,
          artists_collectors_prev: 0,
        },
      ],
      error: null,
    });

    await getAnalyticsStats({ period: 'month', artist: 'sweetman' });

    expect(supabase.rpc).toHaveBeenCalledWith('get_analytics_stats', {
      p_period: 'month',
      p_artist: 'sweetman',
    });
  });

  it('returns empty stats when rpc fails', async () => {
    vi.mocked(supabase.rpc).mockResolvedValue({
      data: null,
      error: { message: 'rpc failed' },
    });

    const result = await getAnalyticsStats({ period: 'all' });

    expect(result).toEqual({
      period: 'all',
      moments_created: { value: 0, prev: null, delta_pct: null },
      moments_airdropped: { value: 0, prev: null, delta_pct: null },
      moments_collected: { value: 0, prev: null, delta_pct: null },
      active_artists: { value: 0, prev: null, delta_pct: null },
      collectors: { value: 0, prev: null, delta_pct: null },
      artists_collectors: { value: 0, prev: null, delta_pct: null },
    });
  });
});

describe('validateAnalyticsStatsQuery', () => {
  it('defaults period to week', () => {
    const req = new NextRequest('http://localhost/api/stats/analytics');
    const result = validateAnalyticsStatsQuery(req);
    expect(result).toEqual({ period: 'week' });
  });

  it('accepts period and artist', () => {
    const req = new NextRequest(
      'http://localhost/api/stats/analytics?period=month&artist=0xabc'
    );
    const result = validateAnalyticsStatsQuery(req);
    expect(result).toEqual({ period: 'month', artist: '0xabc' });
  });

  it('returns 400 for invalid period', () => {
    const req = new NextRequest(
      'http://localhost/api/stats/analytics?period=year'
    );
    const result = validateAnalyticsStatsQuery(req);
    expect(result).toBeInstanceOf(Response);
  });
});

describe('getAnalyticsStatsHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns analytics stats json', async () => {
    vi.mocked(supabase.rpc).mockResolvedValue({
      data: [
        {
          moments_created: 5,
          moments_airdropped: 1,
          moments_collected: 2,
          active_artists: 3,
          collectors: 2,
          artists_collectors: 1,
          moments_created_prev: 4,
          moments_airdropped_prev: 1,
          moments_collected_prev: 2,
          active_artists_prev: 2,
          collectors_prev: 3,
          artists_collectors_prev: 1,
        },
      ],
      error: null,
    });

    const res = await getAnalyticsStatsHandler({ period: 'day' });
    const json = await res.json();

    expect(json).toEqual({
      period: 'day',
      moments_created: { value: 5, prev: 4, delta_pct: 25 },
      moments_airdropped: { value: 1, prev: 1, delta_pct: 0 },
      moments_collected: { value: 2, prev: 2, delta_pct: 0 },
      active_artists: { value: 3, prev: 2, delta_pct: 50 },
      collectors: { value: 2, prev: 3, delta_pct: -33.3 },
      artists_collectors: { value: 1, prev: 1, delta_pct: 0 },
    });
  });
});
