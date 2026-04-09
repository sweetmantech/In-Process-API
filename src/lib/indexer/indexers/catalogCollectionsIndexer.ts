import { processCollectionsInBatches } from '@/lib/indexer/collections/processCollectionsInBatches';
import { selectMaxUpdatedAt } from '@/lib/indexer/collections/selectMaxUpdatedAt';
import type { Catalog_Collections_t } from '@/types/envio';
import type { IndexConfig } from '@/types/indexerFactory';

export const catalogCollectionsIndexer: IndexConfig<Catalog_Collections_t> = {
  processBatchFn: processCollectionsInBatches,
  selectMaxTimestampFn: selectMaxUpdatedAt,
  indexName: 'catalog_collections',
  dataPath: 'Catalog_Collections',
  queryFragment: `Catalog_Collections(limit: $limit, offset: $offset_catalog_collections, order_by: {updated_at: asc}, where: {updated_at: {_gt: $minTimestamp_catalog_collections}}) {
    id address name creator uri chain_id created_at updated_at transaction_hash
  }`,
};
