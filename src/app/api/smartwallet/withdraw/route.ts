import { NextRequest, NextResponse } from 'next/server';
import validateWithdrawBody from '@/lib/smartwallets/validateWithdrawBody';
import withdrawHandler from '@/lib/smartwallets/withdrawHandler';

export async function POST(req: NextRequest) {
  try {
    const validated = await validateWithdrawBody(req);
    if (validated instanceof NextResponse) return validated;
    return withdrawHandler(validated);
  } catch (e: unknown) {
    const message =
      e instanceof Error ? e.message : 'Failed to withdraw from smart wallet';
    return Response.json({ message }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;
