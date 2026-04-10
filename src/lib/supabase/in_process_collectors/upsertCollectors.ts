import { supabase } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/types';

export async function upsertCollectors(
  collectors: Array<
    Database['public']['Tables']['in_process_collectors']['Insert']
  >
): Promise<void> {
  if (!collectors.length) return;
  const { error } = await supabase
    .from('in_process_collectors')
    .upsert(collectors, { onConflict: 'collector,moment,transaction_hash' });
  if (error) throw error;
  console.log(`✅ Upserted ${collectors.length} collector(s)`);
}
