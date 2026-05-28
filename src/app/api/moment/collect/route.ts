import { NextRequest } from 'next/server';
import validateCollectMomentBody from '@/lib/moment/validateCollectMomentBody';
import collectMomentHandler from '@/lib/moment/collectMomentHandler';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const validated = await validateCollectMomentBody(req);
    if (validated instanceof Response) return validated;
    return collectMomentHandler(validated);
  } catch (e: any) {
    return Response.json(
      { message: e?.message ?? 'failed to collect moment' },
      { status: 500 }
    );
  }
}
