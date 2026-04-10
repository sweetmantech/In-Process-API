import { processAdminsInBatches } from '@/lib/indexer/admins/processAdminsInBatches';
import { selectMaxGrantedAt } from '@/lib/indexer/admins/selectMaxGrantedAt';
import type { InProcess_Admins_t } from '@/types/envio';
import type { IndexConfig } from '@/types/indexerFactory';

export const adminsIndexer: IndexConfig<InProcess_Admins_t> = {
  processBatchFn: processAdminsInBatches,
  selectMaxTimestampFn: selectMaxGrantedAt,
  indexName: 'admins',
  dataPath: 'InProcess_Admins',
  queryFragment: `InProcess_Admins(limit: $limit, offset: $offset_admins, order_by: {updated_at: asc}, where: {updated_at: {_gt: $minTimestamp_admins}}) {
    id admin collection token_id chain_id permission updated_at
  }`,
};
