import { supabase } from '@/lib/supabase/client';
import toAnalyticsStatMetric from '@/lib/stats/toAnalyticsStatMetric';
import type { AnalyticsStatsPeriod } from '@/types/analyticsStats';
import {
  emptyAnalyticsStats,
  type AnalyticsStats,
} from '@/types/analyticsStats';

type AnalyticsStatsRow = {
  moments_created: number | string | null;
  moments_airdropped: number | string | null;
  moments_collected: number | string | null;
  active_artists: number | string | null;
  collectors: number | string | null;
  artists_collectors: number | string | null;
  moments_created_prev: number | string | null;
  moments_airdropped_prev: number | string | null;
  moments_collected_prev: number | string | null;
  active_artists_prev: number | string | null;
  collectors_prev: number | string | null;
  artists_collectors_prev: number | string | null;
};

const getAnalyticsStats = async ({
  period,
  artist,
}: {
  period: AnalyticsStatsPeriod;
  artist?: string;
}): Promise<AnalyticsStats> => {
  try {
    const { data, error } = await supabase.rpc('get_analytics_stats', {
      p_period: period,
      p_artist: artist ?? undefined,
    });

    if (error) throw error;

    const row = (data as AnalyticsStatsRow[] | null)?.[0];
    if (!row) return emptyAnalyticsStats(period);

    const includeComparison = period !== 'all';

    return {
      period,
      moments_created: toAnalyticsStatMetric({
        value: row.moments_created,
        prev: row.moments_created_prev,
        includeComparison,
      }),
      moments_airdropped: toAnalyticsStatMetric({
        value: row.moments_airdropped,
        prev: row.moments_airdropped_prev,
        includeComparison,
      }),
      moments_collected: toAnalyticsStatMetric({
        value: row.moments_collected,
        prev: row.moments_collected_prev,
        includeComparison,
      }),
      active_artists: toAnalyticsStatMetric({
        value: row.active_artists,
        prev: row.active_artists_prev,
        includeComparison,
      }),
      collectors: toAnalyticsStatMetric({
        value: row.collectors,
        prev: row.collectors_prev,
        includeComparison,
      }),
      artists_collectors: toAnalyticsStatMetric({
        value: row.artists_collectors,
        prev: row.artists_collectors_prev,
        includeComparison,
      }),
    };
  } catch (error) {
    console.error('[getAnalyticsStats]', error);
    return emptyAnalyticsStats(period);
  }
};

export default getAnalyticsStats;
