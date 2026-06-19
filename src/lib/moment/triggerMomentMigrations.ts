import type {
  Catalog_Moments_t,
  InProcess_Moments_t,
  Sound_Moments_t,
  Zora_Moments_t,
  ZoraMedia_Moments_t,
} from '@/types/envio';
import type { CollectionInfo } from '@/lib/collection/getCollectionInfoMap';
import migrateAssetToArweave from '@/workflows/migrateAssetToArweave';
import type { Address } from 'viem';

export default function triggerMomentMigrations(
  batch:
    | InProcess_Moments_t[]
    | Catalog_Moments_t[]
    | Sound_Moments_t[]
    | Zora_Moments_t[]
    | ZoraMedia_Moments_t[],
  collectionInfoMap: Map<string, CollectionInfo>
): void {
  const inProcessBatch = batch.filter(
    (m): m is InProcess_Moments_t => 'max_supply' in m
  );
  for (const m of inProcessBatch) {
    const info = collectionInfoMap.get(
      `${m.collection.toLowerCase()}:${m.chain_id}`
    );
    if (!info?.creator) continue;
    migrateAssetToArweave({
      artistAddress: info.creator as Address,
      moment: {
        collectionAddress: m.collection as Address,
        tokenId: m.token_id,
        chainId: m.chain_id,
      },
      uri: m.uri,
    });
  }
}
