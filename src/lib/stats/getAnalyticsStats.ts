import { supabase } from '@/lib/supabase/client';
import computeDeltaPct from '@/lib/stats/computeDeltaPct';
import type { AnalyticsStatsPeriod } from '@/types/analyticsStats';
import {
  emptyAnalyticsStats,
  type AnalyticsStatMetric,
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

const toCount = (value: number | string | null | undefined) =>
  Number(value ?? 0);

const toMetric = (
  value: number | string | null | undefined,
  prev: number | string | null | undefined,
  includeComparison: boolean
): AnalyticsStatMetric => {
  const current = toCount(value);
  if (!includeComparison) {
    return { value: current, prev: null, delta_pct: null };
  }

  const previous = toCount(prev);
  return {
    value: current,
    prev: previous,
    delta_pct: computeDeltaPct(current, previous),
  };
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
      moments_created: toMetric(
        row.moments_created,
        row.moments_created_prev,
        includeComparison
      ),
      moments_airdropped: toMetric(
        row.moments_airdropped,
        row.moments_airdropped_prev,
        includeComparison
      ),
      moments_collected: toMetric(
        row.moments_collected,
        row.moments_collected_prev,
        includeComparison
      ),
      active_artists: toMetric(
        row.active_artists,
        row.active_artists_prev,
        includeComparison
      ),
      collectors: toMetric(
        row.collectors,
        row.collectors_prev,
        includeComparison
      ),
      artists_collectors: toMetric(
        row.artists_collectors,
        row.artists_collectors_prev,
        includeComparison
      ),
    };
  } catch (error) {
    console.error('[getAnalyticsStats]', error);
    return emptyAnalyticsStats(period);
  }
};

export default getAnalyticsStats;
