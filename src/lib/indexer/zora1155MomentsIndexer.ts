import { processMomentsInBatches } from '@/lib/moment/processMomentsInBatches';
import { selectMaxUpdatedAt } from '@/lib/moment/selectMaxUpdatedAt';
import type { Zora_Moments_t } from '@/types/envio';
import type { IndexConfig } from '@/types/indexerFactory';

export const zora1155MomentsIndexer: IndexConfig<Zora_Moments_t> = {
  processBatchFn: processMomentsInBatches,
  selectMaxTimestampFn: selectMaxUpdatedAt,
  indexName: 'zora_1155_moments',
  dataPath: 'Zora_Moments',
  queryFragment: `Zora_Moments(limit: $limit, offset: $offset_zora_1155_moments, order_by: {updated_at: asc}, where: {updated_at: {_gt: $minTimestamp_zora_1155_moments}, chain_id: {_eq: 8453}}) {
    id collection token_id uri max_supply chain_id created_at updated_at transaction_hash
  }`,
};
