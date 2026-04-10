import type { Collectors_t } from '@/types/envio';
import { BATCH_SIZE } from '@/lib/consts';
import { mapCollectorsToSupabase } from './mapCollectorsToSupabase';
import { upsertCollectors } from '@/lib/supabase/in_process_collectors/upsertCollectors';
import { ensureArtists } from '@/lib/supabase/in_process_artists/ensureArtists';

export async function processCollectorsInBatches(
  collectors: Collectors_t[]
): Promise<void> {
  let totalProcessed = 0;

  for (let i = 0; i < collectors.length; i += BATCH_SIZE) {
    try {
      const batch = collectors.slice(i, i + BATCH_SIZE);
      const mappedCollectors = await mapCollectorsToSupabase(batch);
      await ensureArtists([
        ...new Set(mappedCollectors.map((c) => c.collector)),
      ]);
      await upsertCollectors(mappedCollectors);
      totalProcessed += mappedCollectors.length;
      console.log(
        `🎁 Batch ${Math.floor(i / BATCH_SIZE) + 1}: Processed ${mappedCollectors.length} collectors`
      );
    } catch (error) {
      console.error(
        `❌ Failed to process batch ${Math.floor(i / BATCH_SIZE) + 1}:`,
        error
      );
    }
  }

  if (totalProcessed > 0)
    console.log(`✅  Completed processing: ${totalProcessed} collectors`);
  else console.log(`ℹ️  No collectors to process`);
}
