import { supabase } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/types';

export async function upsertMoments(
  moments: Array<Database['public']['Tables']['in_process_moments']['Insert']>
): Promise<
  Array<{
    id: string;
    uri: string;
    token_id: number;
    collection: { address: string; creator: string };
  }>
> {
  if (!moments.length) return [];
  const { data, error } = await supabase
    .from('in_process_moments')
    .upsert(moments, { onConflict: 'collection, token_id' })
    .select(
      'id, uri, token_id, collection:in_process_collections(address, creator)'
    );
  if (error) throw error;
  return data ?? [];
}
