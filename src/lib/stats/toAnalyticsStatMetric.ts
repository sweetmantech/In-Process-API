import computeDeltaPct from '@/lib/stats/computeDeltaPct';
import toCount from '@/lib/stats/toCount';
import type { AnalyticsStatMetric } from '@/types/analyticsStats';

const toAnalyticsStatMetric = ({
  value,
  prev,
  includeComparison,
}: {
  value: number | string | null | undefined;
  prev: number | string | null | undefined;
  includeComparison: boolean;
}): AnalyticsStatMetric => {
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

export default toAnalyticsStatMetric;
