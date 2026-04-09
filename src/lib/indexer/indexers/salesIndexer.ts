import { processSalesInBatches } from '@/lib/indexer/sales/processSalesInBatches';
import { selectMaxCreatedAt } from '@/lib/indexer/sales/selectMaxCreatedAt';
import type { Primary_Sales_t } from '@/types/envio';
import type { IndexConfig } from '@/types/indexerFactory';

export const salesIndexer: IndexConfig<Primary_Sales_t> = {
  processBatchFn: processSalesInBatches,
  selectMaxTimestampFn: selectMaxCreatedAt,
  indexName: 'primary_sales',
  dataPath: 'Primary_Sales',
  queryFragment: `Primary_Sales(limit: $limit, offset: $offset_primary_sales, order_by: {created_at: asc}, where: {created_at: {_gt: $minTimestamp_primary_sales}}) {
    id collection token_id sale_start sale_end max_tokens_per_address price_per_token funds_recipient currency chain_id transaction_hash created_at
  }`,
};
