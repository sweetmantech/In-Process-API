import blockTsToISOString from '@/lib/blockTsToISOString';
import type {
  Catalog_Moments_t,
  InProcess_Moments_t,
  Sound_Moments_t,
} from '@/types/envio';
import type { Database } from '@/lib/supabase/types';
import { getCollectionIdMap } from '@/lib/collection/getCollectionIdMap';

export async function mapMomentsToSupabase(
  moments: InProcess_Moments_t[] | Catalog_Moments_t[] | Sound_Moments_t[]
): Promise<
  Array<Database['public']['Tables']['in_process_moments']['Insert']>
> {
  const collectionPairs: Array<[string, number]> = moments.map(
    (m) => [m.collection, m.chain_id] as [string, number]
  );
  const collectionIdMap = await getCollectionIdMap(collectionPairs);

  return moments
    .map((moment) => {
      const collectionId = collectionIdMap.get(
        `${moment.collection.toLowerCase()}:${moment.chain_id}`
      );
      if (!collectionId) return undefined;
      return {
        collection: collectionId,
        token_id: 'tier' in moment ? moment.tier + 1 : Number(moment.token_id),
        uri: moment.uri,
        max_supply: 'max_supply' in moment ? Number(moment.max_supply) : 0,
        created_at: blockTsToISOString(moment.created_at)!,
        updated_at: blockTsToISOString(moment.updated_at)!,
      };
    })
    .filter((m): m is NonNullable<typeof m> => m !== undefined);
}
