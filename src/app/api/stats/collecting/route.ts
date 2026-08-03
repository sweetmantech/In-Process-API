import { NextRequest, NextResponse } from 'next/server';
import validateStatsQuery from '@/lib/stats/validateStatsQuery';
import getCollectingStatsHandler from '@/lib/stats/getCollectingStatsHandler';

export async function GET(req: NextRequest) {
  try {
    const validated = validateStatsQuery(req);
    if (validated instanceof NextResponse) return validated;
    return getCollectingStatsHandler(validated);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Failed';
    return NextResponse.json({ message }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;
