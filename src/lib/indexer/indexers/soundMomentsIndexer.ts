import { processMomentsInBatches } from '@/lib/indexer/moments/processMomentsInBatches';
import { selectMaxUpdatedAt } from '@/lib/indexer/moments/selectMaxUpdatedAt';
import type { Sound_Moments_t } from '@/types/envio';
import type { IndexConfig } from '@/types/indexerFactory';

export const soundMomentsIndexer: IndexConfig<Sound_Moments_t> = {
  processBatchFn: processMomentsInBatches,
  selectMaxTimestampFn: selectMaxUpdatedAt,
  indexName: 'sound_moments',
  dataPath: 'Sound_Moments',
  queryFragment: `Sound_Moments(limit: $limit, offset: $offset_sound_moments, order_by: {updated_at: asc}, where: {updated_at: {_gt: $minTimestamp_sound_moments}}) {
    id collection tier uri chain_id created_at updated_at transaction_hash
  }`,
};
