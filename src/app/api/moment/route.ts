import { NextRequest, NextResponse } from 'next/server';
import validateMomentQuery from '@/lib/moment/validateMomentQuery';
import getMomentHandler from '@/lib/moment/getMomentHandler';

export async function GET(req: NextRequest) {
  try {
    const validated = validateMomentQuery(req);
    if (validated instanceof NextResponse) return validated;
    return await getMomentHandler(validated);
  } catch (error: any) {
    console.error('Error fetching moment info:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch moment info' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;
