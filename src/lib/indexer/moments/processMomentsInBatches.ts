import type {
  Catalog_Moments_t,
  InProcess_Moments_t,
  Sound_Moments_t,
} from '@/types/envio';
import { BATCH_SIZE } from '@/lib/consts';
import { mapMomentsToSupabase } from './mapMomentsToSupabase';
import { upsertMoments } from '@/lib/supabase/in_process_moments/upsertMoments';
import { mapMetadataToSupabase } from './mapMetadataToSupabase';
import { upsertMetadata } from '@/lib/supabase/in_process_metadata/upsertMetadata';
import { upsertArtistNames } from '@/lib/supabase/in_process_artists/upsertArtistNames';

export async function processMomentsInBatches(
  moments: InProcess_Moments_t[] | Catalog_Moments_t[] | Sound_Moments_t[]
): Promise<void> {
  let totalProcessed = 0;

  for (let i = 0; i < moments.length; i += BATCH_SIZE) {
    try {
      const batch = moments.slice(i, i + BATCH_SIZE);
      const mappedMoments = await mapMomentsToSupabase(batch);
      const upsertedMoments = await upsertMoments(mappedMoments);

      const { records: metadataRecords, artistNamesByAddresses } =
        await mapMetadataToSupabase(upsertedMoments);
      await upsertMetadata(metadataRecords);
      await upsertArtistNames(artistNamesByAddresses);

      totalProcessed += mappedMoments.length;
      console.log(
        `📚 Batch ${Math.floor(i / BATCH_SIZE) + 1}: Processing ${batch.length} moments, ${metadataRecords.length} metadata`
      );
    } catch (error) {
      console.error(
        `❌ Failed to process batch ${Math.floor(i / BATCH_SIZE) + 1}:`,
        error
      );
    }
  }

  if (totalProcessed > 0)
    console.log(`✅  Completed processing: ${totalProcessed} moments`);
  else console.log(`ℹ️  No moments to process`);
}
