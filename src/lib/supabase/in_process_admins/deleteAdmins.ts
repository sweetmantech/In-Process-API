import { supabase } from '@/lib/supabase/client';
import type { DeleteAdminCriteria } from '@/types/indexerSupabase';

/**
 * Deletes admins from Supabase based on collection, artist_address, and token_id.
 * @param admins - Array of admin criteria objects to delete.
 * @returns Number of deleted rows.
 */
export async function deleteAdmins(
  admins: DeleteAdminCriteria[]
): Promise<number> {
  if (admins.length === 0) {
    console.log('ℹ️  No admins to delete');
    return 0;
  }

  try {
    let deletedCount = 0;

    for (const admin of admins) {
      const { error } = await supabase
        .from('in_process_admins')
        .delete()
        .eq('collection', admin.collection)
        .eq('artist_address', admin.artist_address)
        .eq('token_id', admin.token_id);

      if (error) {
        console.log('ziad here', admin);
        throw error;
      }
      deletedCount++;
    }

    console.log(`🗑️  Deleted ${deletedCount} admin(s)`);
    return deletedCount;
  } catch (error) {
    console.error(`❌ Failed to delete admins:`, error);
    throw error;
  }
}
