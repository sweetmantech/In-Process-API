import { supabase } from '@/lib/supabase/client';

const insertHidden = async ({
  moment,
  artist,
}: {
  moment: string;
  artist: string;
}) => {
  return supabase.from('in_process_hidden').insert({ moment, artist });
};

export default insertHidden;
