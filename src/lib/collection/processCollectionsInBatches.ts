import type {
  Catalog_Collections_t,
  InProcess_Collections_t,
  Sound_Editions_t,
  Zora_Collections_t,
} from '@/types/envio';
import type { Database } from '@/lib/supabase/types';
import { BATCH_SIZE } from '@/lib/consts';
import { mapCollectionsToSupabase } from './mapCollectionsToSupabase';
import { ensureWallets } from '@/lib/wallets/ensureWallets';
import { upsertCollections } from '@/lib/supabase/in_process_collections/upsertCollections';
import triggerCollectionMigrations from './triggerCollectionMigrations';

type CollectionProtocol = Database['public']['Enums']['collection_protocol'];

export async function processCollectionsInBatches(
  collections:
    | InProcess_Collections_t[]
    | Catalog_Collections_t[]
    | Sound_Editions_t[]
    | Zora_Collections_t[],
  protocol: CollectionProtocol
): Promise<void> {
  let totalProcessed = 0;
  for (let i = 0; i < collections.length; i += BATCH_SIZE) {
    try {
      const batch = collections.slice(i, i + BATCH_SIZE);
      const mappedCollections = mapCollectionsToSupabase(batch, protocol);
      await ensureWallets(mappedCollections.map((c) => c.creator));
      await upsertCollections(mappedCollections);

      triggerCollectionMigrations(batch);

      totalProcessed += mappedCollections.length;
      console.log(
        `📚 Batch ${Math.floor(i / BATCH_SIZE) + 1}: Processing ${batch.length} collections`
      );
    } catch (error) {
      console.error(
        `❌ Failed to process batch ${Math.floor(i / BATCH_SIZE) + 1}:`,
        error
      );
    }
  }
  if (totalProcessed > 0)
    console.log(`✅  Completed processing: ${totalProcessed} collections`);
  else console.log(`ℹ️  No collections to process`);
}
