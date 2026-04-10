import { processCollectionsInBatches } from '@/lib/collection/processCollectionsInBatches';
import { selectMaxUpdatedAt } from '@/lib/collection/selectMaxUpdatedAt';
import type { Sound_Editions_t } from '@/types/envio';
import type { IndexConfig } from '@/types/indexerFactory';

export const soundEditionsIndexer: IndexConfig<Sound_Editions_t> = {
  processBatchFn: processCollectionsInBatches,
  selectMaxTimestampFn: selectMaxUpdatedAt,
  indexName: 'sound_editions',
  dataPath: 'Sound_Editions',
  queryFragment: `Sound_Editions(limit: $limit, offset: $offset_sound_editions, order_by: {updated_at: asc}, where: {updated_at: {_gt: $minTimestamp_sound_editions}}) {
    id address name owner uri chain_id created_at updated_at transaction_hash
  }`,
};
