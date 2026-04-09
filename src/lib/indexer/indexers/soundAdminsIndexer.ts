import { processAdminsInBatches } from '@/lib/indexer/admins/processAdminsInBatches';
import { selectMaxGrantedAt } from '@/lib/indexer/admins/selectMaxGrantedAt';
import type { Sound_Admins_t } from '@/types/envio';
import type { IndexConfig } from '@/types/indexerFactory';

export const soundAdminsIndexer: IndexConfig<Sound_Admins_t> = {
  processBatchFn: processAdminsInBatches,
  selectMaxTimestampFn: selectMaxGrantedAt,
  indexName: 'sound_admins',
  dataPath: 'Sound_Admins',
  queryFragment: `Sound_Admins(limit: $limit, offset: $offset_sound_admins, order_by: {updated_at: asc}, where: {updated_at: {_gt: $minTimestamp_sound_admins}}) {
    id collection token_id admin roles chain_id updated_at
  }`,
};
