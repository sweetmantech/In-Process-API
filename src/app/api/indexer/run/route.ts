import { NextRequest, NextResponse } from 'next/server';
import { executeIndexerCycle } from '@/lib/indexer/executeIndexerCycle';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET(req: NextRequest): Promise<NextResponse> {
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const deadline = Date.now() + 58_000;

  while (Date.now() < deadline) {
    try {
      await executeIndexerCycle();
    } catch (error) {
      console.error('❌ Error in indexer cycle:', error);
    }
  }

  return NextResponse.json({ ok: true });
}
