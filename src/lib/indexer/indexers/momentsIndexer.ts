import { processMomentsInBatches } from '@/lib/indexer/moments/processMomentsInBatches';
import { selectMaxUpdatedAt } from '@/lib/indexer/moments/selectMaxUpdatedAt';
import type { InProcess_Moments_t } from '@/types/envio';
import type { IndexConfig } from '@/types/indexerFactory';

export const momentsIndexer: IndexConfig<InProcess_Moments_t> = {
  processBatchFn: processMomentsInBatches,
  selectMaxTimestampFn: selectMaxUpdatedAt,
  indexName: 'moments',
  dataPath: 'InProcess_Moments',
  queryFragment: `InProcess_Moments(limit: $limit, offset: $offset_moments, order_by: {updated_at: asc}, where: {updated_at: {_gt: $minTimestamp_moments}}) {
    id collection token_id uri max_supply chain_id created_at updated_at transaction_hash
  }`,
};
