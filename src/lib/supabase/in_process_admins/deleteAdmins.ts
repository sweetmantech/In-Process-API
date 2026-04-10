import { supabase } from '@/lib/supabase/client';
import type { DeleteAdminCriteria } from '@/types/indexerSupabase';

export async function deleteAdmins(
  admins: DeleteAdminCriteria[]
): Promise<number> {
  if (!admins.length) return 0;

  let count = 0;
  for (const a of admins) {
    const { data, error } = await supabase
      .from('in_process_admins')
      .delete()
      .eq('collection', a.collection)
      .eq('artist_address', a.artist_address)
      .eq('token_id', a.token_id)
      .select('id');
    if (error) throw error;
    count += data?.length ?? 0;
  }

  console.log(`🗑️  Deleted ${count} admin(s)`);
  return count;
}
