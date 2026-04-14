import { supabase } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/types';

export async function upsertArtists(
  artists: Database['public']['Tables']['in_process_artists']['Insert'][]
): Promise<void> {
  if (!artists.length) return;
  const { error } = await supabase
    .from('in_process_artists')
    .upsert(artists, { onConflict: 'address' });
  if (error) throw error;
}
