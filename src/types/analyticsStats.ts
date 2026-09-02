export type AnalyticsStatsPeriod = 'day' | 'week' | 'month' | 'all';

export type AnalyticsStatMetric = {
  value: number;
  prev: number | null;
  delta_pct: number | null;
};

export type AnalyticsStats = {
  period: AnalyticsStatsPeriod;
  moments_created: AnalyticsStatMetric;
  moments_airdropped: AnalyticsStatMetric;
  moments_collected: AnalyticsStatMetric;
  active_artists: AnalyticsStatMetric;
  collectors: AnalyticsStatMetric;
  artists_collectors: AnalyticsStatMetric;
};

export const emptyAnalyticsStatMetric = (
  period: AnalyticsStatsPeriod
): AnalyticsStatMetric => ({
  value: 0,
  prev: period === 'all' ? null : 0,
  delta_pct: period === 'all' ? null : 0,
});

export const emptyAnalyticsStats = (
  period: AnalyticsStatsPeriod
): AnalyticsStats => ({
  period,
  moments_created: emptyAnalyticsStatMetric(period),
  moments_airdropped: emptyAnalyticsStatMetric(period),
  moments_collected: emptyAnalyticsStatMetric(period),
  active_artists: emptyAnalyticsStatMetric(period),
  collectors: emptyAnalyticsStatMetric(period),
  artists_collectors: emptyAnalyticsStatMetric(period),
});
