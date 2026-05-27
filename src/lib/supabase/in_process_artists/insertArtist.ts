import { supabase } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/types';

const insertArtist = async (
  artist: Database['public']['Tables']['in_process_artists']['Insert']
) => {
  return supabase
    .from('in_process_artists')
    .insert(artist)
    .select('id')
    .single();
};

export default insertArtist;
