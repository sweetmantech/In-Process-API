import { NextRequest, NextResponse } from 'next/server';
import validatePaymentsQuery from '@/lib/payments/validatePaymentsQuery';
import getPaymentsHandler from '@/lib/payments/getPaymentsHandler';

export async function GET(req: NextRequest) {
  try {
    const validated = validatePaymentsQuery(req);
    if (validated instanceof NextResponse) return validated;
    return await getPaymentsHandler(validated);
  } catch (e: any) {
    return Response.json(
      { message: e?.message ?? 'Failed to fetch payments' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
