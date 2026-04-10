import type {
  Catalog_Collections_t,
  InProcess_Collections_t,
  Sound_Editions_t,
} from '@/types/envio';
import { indexerChannel } from '@/lib/supabase/client';

export function broadcastCollectionUpdated(
  collections:
    | InProcess_Collections_t[]
    | Catalog_Collections_t[]
    | Sound_Editions_t[]
): void {
  Promise.all(
    collections.map((collection) =>
      indexerChannel.send({
        type: 'broadcast',
        event: 'collection:updated',
        payload: {
          collectionAddress: collection.address,
          chainId: collection.chain_id,
        },
      })
    )
  ).catch(console.error);
}
