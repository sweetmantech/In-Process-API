import { NextRequest, NextResponse } from 'next/server';
import validateAnalyticsStatsQuery from '@/lib/stats/validateAnalyticsStatsQuery';
import getAnalyticsStatsHandler from '@/lib/stats/getAnalyticsStatsHandler';

export async function GET(req: NextRequest) {
  try {
    const validated = validateAnalyticsStatsQuery(req);
    if (validated instanceof NextResponse) return validated;
    return getAnalyticsStatsHandler(validated);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Failed';
    console.error('[GET /api/stats/analytics]', e);
    return NextResponse.json({ message }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;
