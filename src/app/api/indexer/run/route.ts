import { NextRequest, NextResponse } from 'next/server';
import { executeIndexerCycle } from '@/lib/indexer/executeIndexerCycle';
import { indexers } from '@/lib/indexer/indexers/indexers';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET(req: NextRequest): Promise<NextResponse> {
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Initialize cached timestamps from Supabase once on startup
  const cachedTimestamps: Record<string, number | null> = {};
  const initialTimestamps = await Promise.all(
    indexers.map((i) => i.selectMaxTimestampFn())
  );
  for (let i = 0; i < indexers.length; i++) {
    cachedTimestamps[indexers[i].indexName] = initialTimestamps[i];
  }

  await executeIndexerCycle(cachedTimestamps);

  return NextResponse.json({ ok: true });
}
