import { supabase } from '@/lib/supabase/client';

export async function deletePhone(artist_id: string) {
  const { error } = await supabase
    .from('in_process_artist_phones')
    .delete()
    .eq('artist_id', artist_id);

  if (error) return { error };

  return { error: null };
}
