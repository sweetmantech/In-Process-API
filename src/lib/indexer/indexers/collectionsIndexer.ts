import { processCollectionsInBatches } from '@/lib/indexer/collections/processCollectionsInBatches';
import { selectMaxUpdatedAt } from '@/lib/indexer/collections/selectMaxUpdatedAt';
import type { InProcess_Collections_t } from '@/types/envio';
import type { IndexConfig } from '@/types/indexerFactory';

export const collectionsIndexer: IndexConfig<InProcess_Collections_t> = {
  processBatchFn: processCollectionsInBatches,
  selectMaxTimestampFn: selectMaxUpdatedAt,
  indexName: 'collections',
  dataPath: 'InProcess_Collections',
  queryFragment: `InProcess_Collections(limit: $limit, offset: $offset_collections, order_by: {updated_at: asc}, where: {updated_at: {_gt: $minTimestamp_collections}}) {
    id address name uri default_admin chain_id created_at updated_at transaction_hash
  }`,
};
