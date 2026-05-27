import { supabase } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/types';

type Insert = Database['public']['Tables']['in_process_artists']['Insert'];

export async function upsertArtists(
  artists: Insert | Insert[]
): Promise<{ id: string }[]> {
  const rows = Array.isArray(artists) ? artists : [artists];
  if (!rows.length) return [];
  const { data, error } = await supabase
    .from('in_process_artists')
    .upsert(rows, { onConflict: 'address' })
    .select('id');
  if (error) throw error;
  return data ?? [];
}
