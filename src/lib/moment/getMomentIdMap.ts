import type {
  InProcess_Admins_t,
  InProcess_Moment_Comments_t,
  Primary_Sales_t,
  Transfers_t,
  InProcess_Airdrops_t,
} from '@/types/envio';
import selectMoments from '@/lib/supabase/in_process_moments/selectMoments';

export async function getMomentIdMap(
  entities:
    | InProcess_Admins_t[]
    | InProcess_Moment_Comments_t[]
    | Primary_Sales_t[]
    | Transfers_t[]
    | InProcess_Airdrops_t[]
): Promise<Map<string, string>> {
  if (!entities.length) return new Map();

  const moments = entities.map((e) => ({
    collectionAddress: e.collection as `0x${string}`,
    tokenId: String(e.token_id),
    chainId: e.chain_id,
  }));

  const { data, error } = await selectMoments({ moments });
  if (error) throw error;

  const requestedTriplets = new Set(
    entities.map(
      (e) => `${e.collection.toLowerCase()}:${e.chain_id}:${e.token_id}`
    )
  );
  const momentMap = new Map<string, string>();
  for (const moment of data ?? []) {
    const col = moment.collection as { address: string; chain_id: number };
    const key = `${col.address.toLowerCase()}:${col.chain_id}:${moment.token_id}`;
    if (requestedTriplets.has(key)) {
      momentMap.set(key, moment.id);
    }
  }

  console.log(
    `✅ Retrieved ${momentMap.size} moment ID(s) for ${entities.length} entity(ies)`
  );
  return momentMap;
}
