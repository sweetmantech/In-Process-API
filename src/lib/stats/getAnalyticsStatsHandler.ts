import { NextResponse } from 'next/server';
import getAnalyticsStats from '@/lib/stats/getAnalyticsStats';
import type { AnalyticsStatsQueryParams } from '@/lib/schema/analyticsStatsQuerySchema';

const getAnalyticsStatsHandler = async ({
  period,
  artist,
}: AnalyticsStatsQueryParams) => {
  const stats = await getAnalyticsStats({ period, artist });
  return NextResponse.json(stats);
};

export default getAnalyticsStatsHandler;
