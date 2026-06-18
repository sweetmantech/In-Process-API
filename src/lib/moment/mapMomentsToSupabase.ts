import blockTsToISOString from '@/lib/blockTsToISOString';
import type {
  Catalog_Moments_t,
  InProcess_Moments_t,
  Sound_Moments_t,
  Zora_Moments_t,
  ZoraMedia_Moments_t,
} from '@/types/envio';
import type { Database } from '@/lib/supabase/types';
import type { CollectionInfo } from '@/lib/collection/getCollectionInfoMap';

export function mapMomentsToSupabase(
  moments:
    | InProcess_Moments_t[]
    | Catalog_Moments_t[]
    | Sound_Moments_t[]
    | Zora_Moments_t[]
    | ZoraMedia_Moments_t[],
  collectionInfoMap: Map<string, CollectionInfo>
): Array<Database['public']['Tables']['in_process_moments']['Insert']> {
  return moments
    .map((moment) => {
      const collectionId = collectionInfoMap.get(
        `${moment.collection.toLowerCase()}:${moment.chain_id}`
      )?.id;
      if (!collectionId) return undefined;
      const uri =
        'metadata_uri' in moment
          ? (moment.metadata_uri ?? moment.uri ?? '')
          : (moment.uri ?? '');
      return {
        collection: collectionId,
        token_id: 'tier' in moment ? moment.tier + 1 : Number(moment.token_id),
        uri,
        updated_at: blockTsToISOString(moment.updated_at)!,
        ...('max_supply' in moment &&
          moment.max_supply != null && {
            max_supply: Number(moment.max_supply),
          }),
        ...(moment.created_at != null && {
          created_at: blockTsToISOString(moment.created_at)!,
        }),
      } as Database['public']['Tables']['in_process_moments']['Insert'];
    })
    .filter((m): m is NonNullable<typeof m> => m !== undefined);
}
