import { PAGE_LIMIT } from '@/lib/consts';
import { toEnvioTimestamp } from '@/lib/indexer/toEnvioTimestamp';
import { buildQuery } from '@/lib/indexer/grpc/buildQuery';
import { queryGrpc } from '@/lib/indexer/grpc/queryGrpc';
import { indexers } from '@/lib/indexer/indexers/indexers';
import type { IndexConfig } from '@/types/indexerFactory';

/**
 * Executes a single indexing cycle across all entities.
 * Reads latest timestamps from Supabase, queries the gRPC endpoint,
 * and processes all new data. No while loop — called repeatedly by cron.
 *
 * @returns true if any data was processed, false if everything was up-to-date
 */
export async function executeIndexerCycle(): Promise<boolean> {
  const startTime = Date.now();
  console.log('🔍 Indexing all entities (combined query)');

  // 1. Fetch latest timestamps from Supabase
  const initialTimestamps = await Promise.all(
    indexers.map((i) => i.selectMaxTimestampFn())
  );
  const timestamps: Record<string, number> = {};
  const offsets: Record<string, number> = {};
  for (let i = 0; i < indexers.length; i++) {
    const name = indexers[i].indexName;
    timestamps[name] = toEnvioTimestamp(initialTimestamps[i]);
    offsets[name] = 0;
  }

  // 2. Paginate until all indexers are exhausted
  let hasData = false;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let activeIndexers: IndexConfig<any>[] = [...indexers];

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

  const duration = Date.now() - startTime;
  console.log(`✅ Completed indexing cycle (${duration}ms)`);
  return hasData;
}
