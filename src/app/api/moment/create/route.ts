import { NextRequest, NextResponse } from 'next/server';
import createMomentHandler from '@/lib/moment/createMomentHandler';
import validateCreateMoment from '@/lib/moment/validateCreateMoment';

export async function POST(req: NextRequest) {
  try {
    const validated = await validateCreateMoment(req);
    if (validated instanceof NextResponse) return validated;
    return createMomentHandler(validated);
  } catch (e: any) {
    console.log(e);
    const message = e?.message ?? 'failed to create moment';
    return Response.json({ message }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;
