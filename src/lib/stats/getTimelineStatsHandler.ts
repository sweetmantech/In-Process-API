import { NextResponse } from 'next/server';
import type { StatsQueryParams } from '@/lib/schema/statsQuerySchema';
import getTimelineStats from '@/lib/stats/getTimelineStats';

const getTimelineStatsHandler = async ({ artist }: StatsQueryParams) => {
  const stats = await getTimelineStats(artist);
  return NextResponse.json(stats);
};

export default getTimelineStatsHandler;
