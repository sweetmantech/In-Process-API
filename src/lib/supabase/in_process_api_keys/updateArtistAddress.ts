import { supabase } from '@/lib/supabase/client';

/** Sets `artist_address` on the API key row identified by `id`. */
export async function updateArtistAddress(id: string, artist_address: string) {
  const { error } = await supabase
    .from('in_process_api_keys')
    .update({ artist_address })
    .eq('id', id);

  if (error) return { error };

  return { error: null };
}
