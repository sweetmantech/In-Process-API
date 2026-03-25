import { NextRequest, NextResponse } from 'next/server';
import validateTimelineQuery from '@/lib/timeline/validateTimelineQuery';
import getTimelineHandler from '@/lib/timeline/getTimelineHandler';

export async function GET(req: NextRequest) {
  try {
    const validated = validateTimelineQuery(req);
    if (validated instanceof NextResponse) return validated;
    return await getTimelineHandler(validated);
  } catch (e: any) {
    const message = e?.message ?? 'Failed to fetch timeline';
    return Response.json({ message }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;
