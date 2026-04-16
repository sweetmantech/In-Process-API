import { processAdminsInBatches } from '@/lib/admins/processAdminsInBatches';
import { selectMaxGrantedAt } from '@/lib/admins/selectMaxGrantedAt';
import type { ZoraMedia_Admins_t } from '@/types/envio';
import type { IndexConfig } from '@/types/indexerFactory';

export const zoraAdminsIndexer: IndexConfig<ZoraMedia_Admins_t> = {
  processBatchFn: processAdminsInBatches,
  selectMaxTimestampFn: selectMaxGrantedAt,
  indexName: 'zora_admins',
  dataPath: 'ZoraMedia_Admins',
  queryFragment: `ZoraMedia_Admins(limit: $limit, offset: $offset_zora_admins, order_by: {updated_at: asc}, where: {updated_at: {_gt: $minTimestamp_zora_admins}}) {
    id admin collection token_id chain_id permission updated_at
  }`,
};
