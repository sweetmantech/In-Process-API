import { supabase } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/types';

export async function upsertSales(
  sales: Array<Database['public']['Tables']['in_process_sales']['Insert']>
): Promise<void> {
  if (!sales.length) return;
  const { error } = await supabase
    .from('in_process_sales')
    .upsert(sales, { onConflict: 'moment' });
  if (error) throw error;
}
