import { NextRequest, NextResponse } from 'next/server';
import validateStatsQuery from '@/lib/stats/validateStatsQuery';
import getTimelineStatsHandler from '@/lib/stats/getTimelineStatsHandler';

export async function GET(req: NextRequest) {
  try {
    const validated = validateStatsQuery(req);
    if (validated instanceof NextResponse) return validated;
    return getTimelineStatsHandler(validated);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Failed';
    return NextResponse.json({ message }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;
