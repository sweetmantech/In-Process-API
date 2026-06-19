import { processCollectionsInBatches } from '@/lib/collection/processCollectionsInBatches';
import { selectMaxUpdatedAt } from '@/lib/collection/selectMaxUpdatedAt';
import type { Zora_Collections_t } from '@/types/envio';
import type { IndexConfig } from '@/types/indexerFactory';

export const zoraCollectionsIndexer: IndexConfig<Zora_Collections_t> = {
  processBatchFn: (items) => processCollectionsInBatches(items, 'zora'),
  selectMaxTimestampFn: selectMaxUpdatedAt,
  indexName: 'zora_collections',
  dataPath: 'Zora_Collections',
  queryFragment: `Zora_Collections(limit: $limit, offset: $offset_zora_collections, order_by: {updated_at: asc}, where: {updated_at: {_gt: $minTimestamp_zora_collections}, chain_id: {_eq: 8453}}) {
    id address name default_admin uri chain_id created_at updated_at transaction_hash
  }`,
};
