import { supabase } from '@/lib/supabase/client';
import type { DeleteAdminCriteria } from '@/types/indexerSupabase';

export async function deleteAdmins(
  admins: DeleteAdminCriteria[]
): Promise<number> {
  if (!admins.length) return 0;
  const orConditions = admins
    .map(
      (a) =>
        `and(collection::uuid.eq.${a.collection},artist_address.eq.${a.artist_address},token_id.eq.${a.token_id})`
    )
    .join(',');
  const { data, error } = await supabase
    .from('in_process_admins')
    .delete()
    .or(orConditions)
    .select('id');
  if (error) throw error;
  const count = data?.length ?? 0;
  console.log(`🗑️  Deleted ${count} admin(s)`);
  return count;
}
