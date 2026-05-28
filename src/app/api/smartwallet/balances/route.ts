import { NextRequest, NextResponse } from 'next/server';
import validateGetSmartWalletBalancesQuery from '@/lib/smartwallets/validateGetSmartWalletBalancesQuery';
import getSmartWalletBalancesHandler from '@/lib/smartwallets/getSmartWalletBalancesHandler';

export async function GET(req: NextRequest) {
  try {
    const validated = validateGetSmartWalletBalancesQuery(req);
    if (validated instanceof NextResponse) return validated;
    return getSmartWalletBalancesHandler(validated);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Failed to get balances';
    return Response.json({ message }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;
