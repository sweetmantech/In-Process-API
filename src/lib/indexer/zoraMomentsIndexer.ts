import { processMomentsInBatches } from '@/lib/moment/processMomentsInBatches';
import { selectMaxUpdatedAt } from '@/lib/moment/selectMaxUpdatedAt';
import type { ZoraMedia_Moments_t } from '@/types/envio';
import type { IndexConfig } from '@/types/indexerFactory';

export const zoraMomentsIndexer: IndexConfig<ZoraMedia_Moments_t> = {
  processBatchFn: processMomentsInBatches,
  selectMaxTimestampFn: selectMaxUpdatedAt,
  indexName: 'zoraMoments',
  dataPath: 'ZoraMedia_Moments',
  queryFragment: `ZoraMedia_Moments(limit: $limit, offset: $offset_zoraMoments, order_by: {updated_at: asc}, where: {updated_at: {_gt: $minTimestamp_zoraMoments}}) {
    id collection token_id owner uri metadata_uri chain_id created_at updated_at transaction_hash
  }`,
};
