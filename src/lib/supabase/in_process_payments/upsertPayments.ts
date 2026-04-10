import { supabase } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/types';

export async function upsertPayments(
  payments: Array<Database['public']['Tables']['in_process_payments']['Insert']>
): Promise<void> {
  if (!payments.length) return;
  const { error } = await supabase
    .from('in_process_payments')
    .upsert(payments, { onConflict: 'transaction_hash, buyer, moment' });
  if (error) throw error;
  console.log(`✅ Successfully upserted ${payments.length} payment(s)`);
}
