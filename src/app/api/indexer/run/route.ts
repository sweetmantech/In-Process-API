import { NextRequest, NextResponse } from 'next/server';
import { executeIndexerCycle } from '@/lib/indexer/executeIndexerCycle';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(req: NextRequest): Promise<NextResponse> {
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const deadline = Date.now() + 58_000;

  try {
    while (Date.now() < deadline) {
      await executeIndexerCycle();
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('❌ Fatal error in indexer cron:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
