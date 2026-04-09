import { supabase } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/types';

export async function upsertAirdrops(
  airdrops: Array<Database['public']['Tables']['in_process_airdrops']['Insert']>
): Promise<void> {
  if (!airdrops.length) return;
  const { error } = await supabase
    .from('in_process_airdrops')
    .upsert(airdrops, { onConflict: 'moment,recipient' });
  if (error) throw error;
  console.log(`✅ Upserted ${airdrops.length} airdrop(s)`);
}
