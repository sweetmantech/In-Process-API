import { supabase } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/types';

export async function upsertFeeRecipients(
  feeRecipients: Array<
    Database['public']['Tables']['in_process_moment_fee_recipients']['Insert']
  >
): Promise<void> {
  if (!feeRecipients.length) return;
  const { error } = await supabase
    .from('in_process_moment_fee_recipients')
    .upsert(feeRecipients, { onConflict: 'moment,artist_address' });
  if (error) throw error;
}
