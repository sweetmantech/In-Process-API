import { NextRequest, NextResponse } from 'next/server';
import createWritingMomentHandler from '@/lib/moment/createWritingMomentHandler';
import validateCreateWritingMoment from '@/lib/moment/validateCreateWritingMoment';

export async function POST(req: NextRequest) {
  try {
    const validated = await validateCreateWritingMoment(req);
    if (validated instanceof NextResponse) return validated;
    return createWritingMomentHandler(validated);
  } catch (e: any) {
    console.log(e);
    const message = e?.message ?? 'failed to create writing moment';
    return Response.json({ message }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;
