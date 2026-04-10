import blockTsToISOString from '@/lib/blockTsToISOString';
import type { Payments_t } from '@/types/envio';
import type { Database } from '@/lib/supabase/types';
import { getMomentIdMap } from '@/lib/moment/getMomentIdMap';

export async function mapPaymentsToSupabase(
  deposits: Payments_t[]
): Promise<
  Array<Database['public']['Tables']['in_process_payments']['Insert']>
> {
  const mappedPayments: Array<
    Database['public']['Tables']['in_process_payments']['Insert']
  > = [];
  const momentIdMap = await getMomentIdMap(deposits);

  for (const deposit of deposits) {
    const tripletKey = `${deposit.collection.toLowerCase()}:${deposit.chain_id}:${deposit.token_id}`;
    const momentId = momentIdMap.get(tripletKey);
    if (momentId) {
      const amount = deposit.amount ? parseFloat(deposit.amount) : 0;
      if (amount > 0) {
        mappedPayments.push({
          transaction_hash: deposit.transaction_hash,
          buyer: deposit.spender.toLowerCase(),
          moment: momentId,
          amount,
          transferred_at: blockTsToISOString(deposit.transferred_at),
        });
      }
    }
  }

  return mappedPayments;
}
