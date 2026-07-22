import { NextRequest, NextResponse } from 'next/server';
import createMomentBatchHandler from '@/lib/moment/createMomentBatchHandler';
import validateCreateMomentBatch from '@/lib/moment/validateCreateMomentBatch';

export async function POST(req: NextRequest) {
  try {
    const validated = await validateCreateMomentBatch(req);
    if (validated instanceof NextResponse) return validated;
    return await createMomentBatchHandler(validated);
  } catch (e: any) {
    console.log(e);
    const message = e?.message ?? 'failed to create moment batch';
    return Response.json({ message }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;
