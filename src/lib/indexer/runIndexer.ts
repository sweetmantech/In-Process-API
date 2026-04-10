import { PAGE_LIMIT } from '@/lib/consts';
import msToBlockTs from '@/lib/msToBlockTs';
import { buildQuery } from '@/lib/grpc/buildQuery';
import { queryGrpc } from '@/lib/grpc/queryGrpc';
import { indexers } from '@/lib/indexer/indexers';
import type { IndexConfig } from '@/types/indexerFactory';

/**
 * Executes a single indexing cycle across all entities.
 * Uses cached timestamps (mutated in place) and only refreshes timestamps
 * for indexers that received new data. No while loop — called repeatedly by cron.
 *
 * @returns true if any data was processed, false if everything was up-to-date
 */
export async function runIndexer(
  cachedTimestamps: Record<string, number | null>
): Promise<boolean> {
  const startTime = Date.now();
  console.log('🔍 Indexing all entities (combined query)');

  // 1. Build per-entity state from cached timestamps
  const timestamps: Record<string, number> = {};
  const offsets: Record<string, number> = {};
  for (const indexer of indexers) {
    const name = indexer.indexName;
    timestamps[name] = msToBlockTs(cachedTimestamps[name]);
    offsets[name] = 0;
  }

  // 2. Paginate until all indexers are exhausted
  let hasData = false;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let activeIndexers: IndexConfig<any>[] = [...indexers];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const indexersWithData = new Set<IndexConfig<any>>();

  while (activeIndexers.length > 0) {
    const query = buildQuery(activeIndexers);
    const variables: Record<string, number> = { limit: PAGE_LIMIT };
    for (const { indexName } of activeIndexers) {
      variables[`offset_${indexName}`] = offsets[indexName];
      variables[`minTimestamp_${indexName}`] = timestamps[indexName];
    }

    const results = await queryGrpc(query, variables);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const nextActive: IndexConfig<any>[] = [];

    await Promise.all(
      activeIndexers.map(async (indexer) => {
        const entities = results[indexer.dataPath] || [];
        if (entities.length === 0) return;

        hasData = true;
        indexersWithData.add(indexer);
        console.log(
          `💻 ${indexer.indexName}: Processing ${offsets[indexer.indexName]} ~ ${offsets[indexer.indexName] + entities.length}`
        );
        await indexer.processBatchFn(entities as never[]);

        offsets[indexer.indexName] += entities.length;
        if (entities.length === PAGE_LIMIT) {
          nextActive.push(indexer);
        }
      })
    );

    activeIndexers = nextActive;
  }

  // 3. Refresh cached timestamps only for indexers that received new data
  if (indexersWithData.size > 0) {
    const refreshed = await Promise.all(
      [...indexersWithData].map(async (indexer) => ({
        name: indexer.indexName,
        timestamp: await indexer.selectMaxTimestampFn(),
      }))
    );
    for (const { name, timestamp } of refreshed) {
      cachedTimestamps[name] = timestamp;
    }
  }

  const duration = Date.now() - startTime;
  console.log(`✅ Completed indexing cycle (${duration}ms)`);
  return hasData;
}
