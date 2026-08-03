import { NextResponse } from 'next/server';
import type { StatsQueryParams } from '@/lib/schema/statsQuerySchema';
import getCollectingStats from '@/lib/stats/getCollectingStats';

const getCollectingStatsHandler = async ({ artist }: StatsQueryParams) => {
  const stats = await getCollectingStats(artist);
  return NextResponse.json(stats);
};

export default getCollectingStatsHandler;
