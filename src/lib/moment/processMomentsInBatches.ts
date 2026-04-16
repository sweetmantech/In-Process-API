import type {
  Catalog_Moments_t,
  InProcess_Moments_t,
  Sound_Moments_t,
  ZoraMedia_Moments_t,
} from '@/types/envio';
import { BATCH_SIZE } from '@/lib/consts';
import { mapMomentsToSupabase } from './mapMomentsToSupabase';
import { getMomentUris } from './getMomentUris';
import { upsertMoments } from '@/lib/supabase/in_process_moments/upsertMoments';
import { mapMetadataToSupabase } from './mapMetadataToSupabase';
import { upsertMetadata } from '@/lib/supabase/in_process_metadata/upsertMetadata';
import { upsertArtistNames } from '@/lib/supabase/in_process_artists/upsertArtistNames';

export async function processMomentsInBatches(
  moments:
    | InProcess_Moments_t[]
    | Catalog_Moments_t[]
    | Sound_Moments_t[]
    | ZoraMedia_Moments_t[]
): Promise<void> {
  let totalProcessed = 0;

  for (let i = 0; i < moments.length; i += BATCH_SIZE) {
    try {
      const batch = moments.slice(i, i + BATCH_SIZE);
      const momentUris = getMomentUris(batch);
      const mappedMoments = await mapMomentsToSupabase(batch);
      const upsertedMoments = await upsertMoments(mappedMoments);

      const momentsWithUris = upsertedMoments.map((m) => ({
        ...m,
        ...momentUris.get(`${m.collection.address}:${m.token_id}`),
      }));

      const { records: metadataRecords, artistNamesByAddresses } =
        await mapMetadataToSupabase(momentsWithUris);
      await upsertMetadata(metadataRecords);
      await upsertArtistNames(artistNamesByAddresses);

      totalProcessed += mappedMoments.length;
      console.log(
        `📚 Batch ${Math.floor(i / BATCH_SIZE) + 1}: Processing ${upsertedMoments.length} moments, ${metadataRecords.length} metadata`
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
