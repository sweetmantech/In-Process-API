import { processPaymentsInBatches } from '@/lib/indexer/payments/processPaymentsInBatches';
import { selectMaxTransferredAt } from '@/lib/indexer/payments/selectMaxTransferredAt';
import type { Payments_t } from '@/types/envio';
import type { IndexConfig } from '@/types/indexerFactory';

export const paymentsIndexer: IndexConfig<Payments_t> = {
  processBatchFn: processPaymentsInBatches,
  selectMaxTimestampFn: selectMaxTransferredAt,
  indexName: 'payments',
  dataPath: 'Payments',
  queryFragment: `Payments(limit: $limit, offset: $offset_payments, order_by: {transferred_at: asc}, where: {transferred_at: {_gt: $minTimestamp_payments}}) {
    id collection currency token_id recipient spender amount chain_id transaction_hash transferred_at
  }`,
};
