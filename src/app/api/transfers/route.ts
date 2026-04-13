import { NextRequest, NextResponse } from 'next/server';
import validateTransfersQuery from '@/lib/transfers/validateTransfersQuery';
import getTransfersHandler from '@/lib/transfers/getTransfersHandler';

export async function GET(req: NextRequest) {
  try {
    const validated = validateTransfersQuery(req);
    if (validated instanceof NextResponse) return validated;
    return await getTransfersHandler(validated);
  } catch (e: any) {
    return Response.json(
      { message: e?.message ?? 'Failed to fetch transfers' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;
