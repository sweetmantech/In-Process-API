import { NextRequest, NextResponse } from 'next/server';
import nudgesHandler from '@/lib/nudges/nudgesHandler';
import validateCronHandler from '@/lib/cron/validateCronHandler';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET(req: NextRequest) {
  const unauthorized = validateCronHandler(req);
  if (unauthorized) return unauthorized;

  try {
    return await nudgesHandler();
  } catch (e: any) {
    console.error('[GET /api/nudges]', e);
    return NextResponse.json(
      { message: e?.message ?? 'Failed' },
      { status: 500 }
    );
  }
}
