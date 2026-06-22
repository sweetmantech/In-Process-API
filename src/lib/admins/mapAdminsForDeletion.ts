import type { InProcess_Admins_t } from '@/types/envio';
import { getCollectionInfoMap } from '@/lib/collection/getCollectionInfoMap';
import type { DeleteAdminCriteria } from '@/types/indexerSupabase';

export async function mapAdminsForDeletion(
  admins: InProcess_Admins_t[]
): Promise<DeleteAdminCriteria[]> {
  const collectionPairs: Array<[string, number]> = admins.map(
    (a) => [a.collection, a.chain_id] as [string, number]
  );
  const collectionIdMap = await getCollectionInfoMap(collectionPairs);

  return admins
    .map((admin) => {
      const collectionId = collectionIdMap.get(
        `${admin.collection.toLowerCase()}:${admin.chain_id}`
      )?.id;
      if (!collectionId) return undefined;
      return {
        collection: collectionId,
        token_id: Number(admin.token_id),
        artist_address: admin.admin.toLowerCase(),
      };
    })
    .filter((a): a is DeleteAdminCriteria => a !== undefined);
}
