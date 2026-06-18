import { NextRequest, NextResponse } from 'next/server';
import getSmartWalletHandler from '@/lib/smartwallets/getSmartWalletHandler';
import validateGetSmartWalletQuery from '@/lib/smartwallets/validateGetSmartWalletQuery';

export async function GET(req: NextRequest) {
  try {
    const validated = validateGetSmartWalletQuery(req);
    if (validated instanceof NextResponse) return validated;
    return getSmartWalletHandler(validated);
  } catch (e: any) {
    console.log(e);
    const message = e?.message ?? 'failed to get smart wallet.';
    return Response.json({ message }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;
