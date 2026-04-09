import { NextRequest, NextResponse } from 'next/server';
import { executeIndexerCycle } from '@/lib/indexer/executeIndexerCycle';
import { indexers } from '@/lib/indexer/indexers/indexers';
import loadCachedTimestamps from '@/lib/indexer/kv/loadCachedTimestamps';
import saveCachedTimestamps from '@/lib/indexer/kv/saveCachedTimestamps';
import sleep from '@/lib/sleep';
import { INDEX_INTERVAL_MS, INDEX_INTERVAL_EMPTY_MS } from '@/lib/consts';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET(req: NextRequest): Promise<NextResponse> {
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Load cached timestamps from KV — fall back to Supabase only on first run ever
  let cachedTimestamps = await loadCachedTimestamps();
  if (!cachedTimestamps) {
    console.log('⚡ No KV cache found — fetching timestamps from Supabase');
    cachedTimestamps = {};
    const initialTimestamps = await Promise.all(
      indexers.map((i) => i.selectMaxTimestampFn())
    );
    for (let i = 0; i < indexers.length; i++) {
      cachedTimestamps[indexers[i].indexName] = initialTimestamps[i];
    }
    await saveCachedTimestamps(cachedTimestamps);
  }

  const deadline = Date.now() + 58_000;

  while (Date.now() < deadline) {
    try {
      const hasData = await executeIndexerCycle(cachedTimestamps);
      if (hasData) await saveCachedTimestamps(cachedTimestamps);
      await sleep(hasData ? INDEX_INTERVAL_MS : INDEX_INTERVAL_EMPTY_MS);
    } catch (error) {
      console.error('❌ Error in indexer cycle:', error);
      await sleep(INDEX_INTERVAL_MS);
    }
  }

  return NextResponse.json({ ok: true });
}
