import { supabase } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/types';

type Update = Database['public']['Tables']['in_process_artists']['Update'];

const updateArtistById = async (id: string, fields: Update): Promise<void> => {
  const { error } = await supabase
    .from('in_process_artists')
    .update(fields)
    .eq('id', id);
  if (error) throw error;
};

export default updateArtistById;
