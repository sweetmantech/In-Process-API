import { NextRequest, NextResponse } from 'next/server';
import { runIndexer } from '@/lib/indexer/runIndexer';
import { indexers } from '@/lib/indexer/indexers';
import loadCachedTimestamps from '@/lib/redis/loadCachedTimestamps';
import saveCachedTimestamps from '@/lib/redis/saveCachedTimestamps';
import sleep from '@/lib/sleep';
import { INDEX_INTERVAL_MS, INDEX_INTERVAL_EMPTY_MS } from '@/lib/consts';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET(req: NextRequest): Promise<NextResponse> {
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Load cached timestamps from Redis — fall back to Supabase only on first run ever
  let cachedTimestamps = await loadCachedTimestamps();
  if (!cachedTimestamps) {
    console.log('⚡ No Redis cache found — fetching timestamps from Supabase');
    cachedTimestamps = {};
    const initialTimestamps = await Promise.all(
      indexers.map((i) => i.selectMaxTimestampFn())
    );
    for (let i = 0; i < indexers.length; i++) {
      cachedTimestamps[indexers[i].indexName] = initialTimestamps[i];
    }
    await saveCachedTimestamps(cachedTimestamps);
  }
  console.log(
    '🕐 Cached timestamps:',
    JSON.stringify(cachedTimestamps, null, 2)
  );

  const deadline = Date.now() + maxDuration * 1000 - 2_000;

  while (Date.now() < deadline) {
    try {
      const hasData = await runIndexer(cachedTimestamps);
      if (hasData) await saveCachedTimestamps(cachedTimestamps);
      const sleepMs = hasData ? INDEX_INTERVAL_MS : INDEX_INTERVAL_EMPTY_MS;
      await sleep(Math.min(sleepMs, deadline - Date.now()));
    } catch (error) {
      console.warn('⚠️ Warn in indexer cycle:', error);
      await sleep(Math.min(INDEX_INTERVAL_MS, deadline - Date.now()));
    }
  }

  return NextResponse.json({ ok: true });
}
