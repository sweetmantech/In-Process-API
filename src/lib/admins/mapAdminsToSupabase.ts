import blockTsToISOString from '@/lib/blockTsToISOString';
import type {
  Catalog_Admins_t,
  InProcess_Admins_t,
  Sound_Admins_t,
  ZoraMedia_Admins_t,
} from '@/types/envio';
import type { Database } from '@/lib/supabase/types';
import { getCollectionIdMap } from '@/lib/collection/getCollectionIdMap';

export async function mapAdminsToSupabase(
  admins: (
    | InProcess_Admins_t
    | Catalog_Admins_t
    | Sound_Admins_t
    | ZoraMedia_Admins_t
  )[]
): Promise<Database['public']['Tables']['in_process_admins']['Insert'][]> {
  const collectionPairs: Array<[string, number]> = admins.map(
    (a) => [a.collection, a.chain_id] as [string, number]
  );
  const collectionIdMap = await getCollectionIdMap(collectionPairs);

  return admins
    .map((admin) => {
      const collectionId = collectionIdMap.get(
        `${admin.collection.toLowerCase()}:${admin.chain_id}`
      );
      if (!collectionId) return undefined;
      return {
        collection: collectionId,
        token_id: Number(admin.token_id),
        artist_address: admin.admin.toLowerCase(),
        granted_at: blockTsToISOString(admin.updated_at),
      };
    })
    .filter((a): a is NonNullable<typeof a> => a !== undefined);
}
