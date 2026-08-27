import { NextRequest, NextResponse } from 'next/server';
import validateCronHandler from '@/lib/cron/validateCronHandler';
import cleanupExpiredMediaCache from '@/lib/media/cleanupExpiredMediaCache';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET(req: NextRequest) {
  const unauthorized = validateCronHandler(req);
  if (unauthorized) return unauthorized;

  try {
    const result = await cleanupExpiredMediaCache();
    return NextResponse.json({ status: 'success', ...result });
  } catch (e: any) {
    console.error('[GET /api/media/cache/cleanup]', e);
    return NextResponse.json(
      { message: e?.message ?? 'Failed' },
      { status: 500 }
    );
  }
}
