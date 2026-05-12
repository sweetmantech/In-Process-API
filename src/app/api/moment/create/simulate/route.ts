import { NextRequest, NextResponse } from 'next/server';
import simulateCreateMomentHandler from '@/lib/moment/simulateCreateMomentHandler';
import validateCreateMoment from '@/lib/moment/validateCreateMoment';

export async function POST(req: NextRequest) {
  try {
    const validated = await validateCreateMoment(req);
    if (validated instanceof NextResponse) return validated;
    return simulateCreateMomentHandler(validated);
  } catch (e: any) {
    console.error(e);
    const message = e?.message ?? 'Unable to simulate moment creation.';
    return Response.json({ message }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;
