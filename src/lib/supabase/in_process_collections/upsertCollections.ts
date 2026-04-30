import { supabase } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/types';

export async function upsertCollections(
  collections: Array<
    Database['public']['Tables']['in_process_collections']['Insert']
  >
): Promise<Array<{ id: string }>> {
  if (!collections.length) return [];
  const { data, error } = await supabase
    .from('in_process_collections')
    .upsert(collections, { onConflict: 'address, chain_id' })
    .select('id');
  if (error) throw error;
  return data ?? [];
}
