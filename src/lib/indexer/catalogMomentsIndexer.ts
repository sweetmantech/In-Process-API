import { processMomentsInBatches } from '@/lib/moment/processMomentsInBatches';
import { selectMaxUpdatedAt } from '@/lib/moment/selectMaxUpdatedAt';
import type { Catalog_Moments_t } from '@/types/envio';
import type { IndexConfig } from '@/types/indexerFactory';

export const catalogMomentsIndexer: IndexConfig<Catalog_Moments_t> = {
  processBatchFn: processMomentsInBatches,
  selectMaxTimestampFn: selectMaxUpdatedAt,
  indexName: 'catalog_moments',
  dataPath: 'Catalog_Moments',
  queryFragment: `Catalog_Moments(limit: $limit, offset: $offset_catalog_moments, order_by: {updated_at: asc}, where: {updated_at: {_gt: $minTimestamp_catalog_moments}}) {
    id collection token_id artist uri chain_id created_at updated_at transaction_hash
  }`,
};
