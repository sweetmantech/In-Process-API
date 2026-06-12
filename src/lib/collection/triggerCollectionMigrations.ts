import type {
  Catalog_Collections_t,
  InProcess_Collections_t,
  Sound_Editions_t,
} from '@/types/envio';
import migrateAssetToArweave from '@/workflows/migrateAssetToArweave';
import type { Address } from 'viem';

export default function triggerCollectionMigrations(
  batch:
    | InProcess_Collections_t[]
    | Catalog_Collections_t[]
    | Sound_Editions_t[]
): void {
  const inProcessBatch = batch.filter(
    (c): c is InProcess_Collections_t => 'default_admin' in c
  );
  for (const c of inProcessBatch) {
    migrateAssetToArweave({
      artistAddress: c.default_admin as Address,
      moment: {
        collectionAddress: c.address as Address,
        tokenId: '0',
        chainId: c.chain_id,
      },
      uri: c.uri,
    });
  }
}
