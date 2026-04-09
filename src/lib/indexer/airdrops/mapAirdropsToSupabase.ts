import toSupabaseTimestamp from '@/lib/indexer/toSupabaseTimestamp';
import type { InProcess_Airdrops_t } from '@/types/envio';
import type { Database } from '@/lib/supabase/types';
import { getMomentIdMap } from '@/lib/indexer/moments/getMomentIdMap';

export async function mapAirdropsToSupabase(
  airdrops: InProcess_Airdrops_t[]
): Promise<Database['public']['Tables']['in_process_airdrops']['Insert'][]> {
  const momentIdMap = await getMomentIdMap(airdrops);

  return airdrops
    .map((airdrop) => {
      const tripletKey = `${airdrop.collection.toLowerCase()}:${airdrop.chain_id}:${airdrop.token_id}`;
      const momentId = momentIdMap.get(tripletKey);
      if (!momentId) return undefined;
      return {
        moment: momentId,
        recipient: airdrop.recipient.toLowerCase(),
        amount: Number(airdrop.amount),
        updated_at: toSupabaseTimestamp(airdrop.updated_at),
      };
    })
    .filter((a): a is NonNullable<typeof a> => a !== undefined);
}
