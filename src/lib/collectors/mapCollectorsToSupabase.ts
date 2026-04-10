import blockTsToISOString from '@/lib/blockTsToISOString';
import type { Collectors_t } from '@/types/envio';
import type { Database } from '@/lib/supabase/types';
import { getMomentIdMap } from '@/lib/moment/getMomentIdMap';

export async function mapCollectorsToSupabase(
  collectors: Collectors_t[]
): Promise<Database['public']['Tables']['in_process_collectors']['Insert'][]> {
  const momentIdMap = await getMomentIdMap(collectors);

  return collectors
    .map((collector) => {
      const tripletKey = `${collector.collection.toLowerCase()}:${collector.chain_id}:${collector.token_id}`;
      const momentId = momentIdMap.get(tripletKey);
      if (!momentId) return undefined;
      return {
        moment: momentId,
        collector: collector.collector.toLowerCase(),
        amount: Number(collector.amount),
        transaction_hash: collector.transaction_hash.toLowerCase(),
        collected_at: blockTsToISOString(collector.collected_at),
      };
    })
    .filter((c): c is NonNullable<typeof c> => c !== undefined);
}
