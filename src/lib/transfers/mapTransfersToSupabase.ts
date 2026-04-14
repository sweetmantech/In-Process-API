import blockTsToISOString from '@/lib/blockTsToISOString';
import { getMomentIdMap } from '@/lib/moment/getMomentIdMap';
import type { Database } from '@/lib/supabase/types';
import type { Transfers_t } from '@/types/envio';
import { formatUnits, zeroAddress } from 'viem';

export async function mapTransfersToSupabase(
  transfers: Transfers_t[]
): Promise<
  Array<Database['public']['Tables']['in_process_transfers']['Insert']>
> {
  const momentIdMap = await getMomentIdMap(transfers);

  const transferMap = new Map<
    string,
    Database['public']['Tables']['in_process_transfers']['Insert']
  >();

  for (const transfer of transfers) {
    const tripletKey = `${transfer.collection.toLowerCase()}:${transfer.chain_id}:${transfer.token_id}`;
    const momentId = momentIdMap.get(tripletKey);

    if (momentId) {
      const uniqueKey = `${transfer.recipient.toLowerCase()}-${transfer.transaction_hash}-${momentId}`;
      const quantityNum = Number(transfer.quantity);
      const valueNum =
        transfer.value && transfer.currency
          ? Number(
              formatUnits(
                BigInt(transfer.value),
                transfer.currency === zeroAddress ? 18 : 6
              )
            )
          : null;

      const existing = transferMap.get(uniqueKey);
      if (existing) {
        existing.quantity += quantityNum;
        if (valueNum !== null) {
          existing.value = (existing.value ?? 0) + valueNum;
        }
      } else {
        transferMap.set(uniqueKey, {
          recipient: transfer.recipient.toLowerCase(),
          quantity: quantityNum,
          value: valueNum,
          currency: transfer.currency?.toLowerCase() ?? null,
          transaction_hash: transfer.transaction_hash,
          transferred_at: blockTsToISOString(transfer.transferred_at),
          moment: momentId,
        });
      }
    }
  }

  return Array.from(transferMap.values());
}
