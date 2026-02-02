import { supabase } from '@/lib/supabase/client';
import { TablesInsert } from '@/lib/supabase/types';

const insertMessageMetadata = async ({
  artist_address,
  client,
}: TablesInsert<'in_process_message_metadata'>) => {
  const { data, error } = await supabase
    .from('in_process_message_metadata')
    .insert({
      artist_address,
      client,
    })
    .select()
    .single();

  if (error) return { error, data: null };

  return { error: null, data };
};

export default insertMessageMetadata;
