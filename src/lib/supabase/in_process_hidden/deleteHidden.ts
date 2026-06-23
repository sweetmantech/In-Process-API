import { supabase } from '@/lib/supabase/client';

const deleteHidden = async ({
  moment,
  artist,
}: {
  moment: string;
  artist: string;
}) => {
  return supabase
    .from('in_process_hidden')
    .delete()
    .eq('moment', moment)
    .eq('artist', artist);
};

export default deleteHidden;
