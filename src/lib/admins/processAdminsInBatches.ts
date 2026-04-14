import type {
  Catalog_Admins_t,
  InProcess_Admins_t,
  Sound_Admins_t,
} from '@/types/envio';
import { BATCH_SIZE } from '@/lib/consts';
import { mapAdminsToSupabase } from './mapAdminsToSupabase';
import { mapAdminsForDeletion } from './mapAdminsForDeletion';
import upsertAdmins from '@/lib/supabase/in_process_admins/upsertAdmins';
import { deleteAdmins } from '@/lib/supabase/in_process_admins/deleteAdmins';
import { ensureArtists } from '@/lib/artists/ensureArtists';
import { getScope } from './getScope';

export async function processAdminsInBatches(
  admins: (InProcess_Admins_t | Catalog_Admins_t | Sound_Admins_t)[]
): Promise<void> {
  let totalDeleted = 0;
  let totalUpserted = 0;

  for (let i = 0; i < admins.length; i += BATCH_SIZE) {
    try {
      const batch = admins.slice(i, i + BATCH_SIZE);
      const batchToDelete = batch.filter((a) => getScope(a) === 0);
      const batchToUpsert = batch.filter((a) => getScope(a) !== 0);

      if (batchToDelete.length > 0) {
        const deleteCriteria = await mapAdminsForDeletion(batchToDelete);
        totalDeleted += await deleteAdmins(deleteCriteria);
      }

      if (batchToUpsert.length > 0) {
        const mappedAdmins = await mapAdminsToSupabase(batchToUpsert);
        await ensureArtists(mappedAdmins.map((a) => a.artist_address));
        await upsertAdmins({ admins: mappedAdmins });
        totalUpserted += mappedAdmins.length;
      }

      console.log(
        `👥 Batch ${Math.floor(i / BATCH_SIZE) + 1}: ${totalDeleted} deleted, ${totalUpserted} upserted`
      );
    } catch (error) {
      console.error(
        `❌ Failed to process batch ${Math.floor(i / BATCH_SIZE) + 1}:`,
        error
      );
    }
  }

  if (totalDeleted > 0 || totalUpserted > 0)
    console.log(
      `✅  Completed processing: ${totalDeleted} deleted, ${totalUpserted} upserted`
    );
  else console.log(`ℹ️  No admins to process`);
}
