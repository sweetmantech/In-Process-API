import { supabase } from '@/lib/supabase/client';

const deleteArtist = async (artistId: string) => {
  const { error } = await supabase
    .from('in_process_artists')
    .delete()
    .eq('id', artistId);
  if (error) throw error;
};

export default deleteArtist;
