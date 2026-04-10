import { supabase } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/types';

export async function upsertMoments(
  moments: Array<Database['public']['Tables']['in_process_moments']['Insert']>
): Promise<
  Array<{ id: string; uri: string; collection: { creator: string } }>
> {
  if (!moments.length) return [];
  const { data, error } = await supabase
    .from('in_process_moments')
    .upsert(moments, { onConflict: 'collection, token_id' })
    .select('id, uri, collection:in_process_collections(creator)');
  if (error) throw error;
  console.log(`✅ upsertMoments: Upserted ${moments.length} moments`);
  return data ?? [];
}
