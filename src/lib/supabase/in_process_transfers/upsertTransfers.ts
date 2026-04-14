import { supabase } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/types';

export async function upsertTransfers(
  rows: Array<Database['public']['Tables']['in_process_transfers']['Insert']>
): Promise<void> {
  if (rows.length === 0) {
    console.log('ℹ️  No transfers to upsert');
    return;
  }

  const { error } = await supabase
    .from('in_process_transfers')
    .upsert(rows, { onConflict: 'recipient,transaction_hash,moment' });

  if (error) {
    console.error('❌ Failed to upsert transfers:', error);
    throw error;
  }

  console.log(`✅ Successfully upserted ${rows.length} transfer(s)`);
}
