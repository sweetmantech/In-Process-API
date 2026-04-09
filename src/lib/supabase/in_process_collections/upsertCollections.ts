import { supabase } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/types';

export async function upsertCollections(
  collections: Array<
    Database['public']['Tables']['in_process_collections']['Insert']
  >
): Promise<void> {
  if (!collections.length) return;
  const { error } = await supabase
    .from('in_process_collections')
    .upsert(collections, { onConflict: 'address, chain_id' });
  if (error) throw error;
  console.log(
    `✅ upsertCollections: Upserted ${collections.length} collections`
  );
}
