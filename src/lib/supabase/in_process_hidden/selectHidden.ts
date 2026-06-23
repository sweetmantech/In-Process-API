import { supabase } from '@/lib/supabase/client';

const selectHidden = async ({
  moment,
  artist,
}: {
  moment: string;
  artist: string;
}) => {
  return supabase
    .from('in_process_hidden')
    .select('id')
    .eq('moment', moment)
    .eq('artist', artist)
    .maybeSingle();
};

export default selectHidden;
