import { processCollectorsInBatches } from '@/lib/collectors/processCollectorsInBatches';
import { selectMaxCollectedAt } from '@/lib/collectors/selectMaxCollectedAt';
import type { Collectors_t } from '@/types/envio';
import type { IndexConfig } from '@/types/indexerFactory';

export const collectorsIndexer: IndexConfig<Collectors_t> = {
  processBatchFn: processCollectorsInBatches,
  selectMaxTimestampFn: selectMaxCollectedAt,
  indexName: 'collectors',
  dataPath: 'Collectors',
  queryFragment: `Collectors(limit: $limit, offset: $offset_collectors, order_by: {collected_at: asc}, where: {collected_at: {_gt: $minTimestamp_collectors}}) {
    id collection token_id amount chain_id collector transaction_hash collected_at
  }`,
};
