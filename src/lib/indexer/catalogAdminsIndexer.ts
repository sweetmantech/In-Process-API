import { processAdminsInBatches } from '@/lib/admins/processAdminsInBatches';
import { selectMaxGrantedAt } from '@/lib/admins/selectMaxGrantedAt';
import type { Catalog_Admins_t } from '@/types/envio';
import type { IndexConfig } from '@/types/indexerFactory';

export const catalogAdminsIndexer: IndexConfig<Catalog_Admins_t> = {
  processBatchFn: processAdminsInBatches,
  selectMaxTimestampFn: selectMaxGrantedAt,
  indexName: 'catalog_admins',
  dataPath: 'Catalog_Admins',
  queryFragment: `Catalog_Admins(limit: $limit, offset: $offset_catalog_admins, order_by: {updated_at: asc}, where: {updated_at: {_gt: $minTimestamp_catalog_admins}}) {
    id admin collection token_id chain_id auth_scope updated_at
  }`,
};
