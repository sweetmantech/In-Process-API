import { supabase } from '@/lib/supabase/client';
import { TablesInsert } from '@/lib/supabase/types';

const insertMessage = async ({
  metadata,
  parts,
  role,
}: TablesInsert<'in_process_messages'>) => {
  const { data, error } = await supabase
    .from('in_process_messages')
    .insert({
      metadata,
      parts,
      role,
    })
    .select('id')
    .single();

  if (error) return { error, data: null };

  return { error: null, data };
};

export default insertMessage;
