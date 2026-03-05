import { supabase } from '@/lib/supabase/client';
import { CHAIN_ID } from '@/lib/consts';
import { PostgrestError } from '@supabase/supabase-js';

export async function getInProcessMomentsTotalCnt(): Promise<{
  count: number | null;
  error: PostgrestError | null;
}> {
  const { count, error } = await supabase
    .from('in_process_moments')
    .select(
      'id, collection:in_process_collections!inner(chain_id, creator, artist:in_process_artists!inner(username))',
      { count: 'exact', head: true }
    )
    .neq('uri', '')
    .eq('collection.chain_id', CHAIN_ID)
    .not('collection.artist.username', 'is', null)
    .neq('collection.artist.username', '');

  return { count, error };
}
