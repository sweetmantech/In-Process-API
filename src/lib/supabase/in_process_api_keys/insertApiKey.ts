import { supabase } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/types';

export async function insertApiKey({
  name,
  artist_id,
  key_hash,
}: Database['public']['Tables']['in_process_api_keys']['Insert']) {
  const { error } = await supabase.from('in_process_api_keys').insert({
    name,
    artist_id,
    key_hash,
  });

  if (error) return { error };

  return { error: null };
}
