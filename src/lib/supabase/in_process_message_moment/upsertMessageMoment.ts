import { supabase } from '@/lib/supabase/client';
import { TablesInsert } from '@/lib/supabase/types';

const upsertMessageMoment = async ({
  message,
  moment,
}: TablesInsert<'in_process_message_moment'>) => {
  const { data, error } = await supabase
    .from('in_process_message_moment')
    .upsert(
      {
        message,
        moment,
      },
      {
        onConflict: 'message,moment',
      }
    )
    .select('*, message(*), moment(*)')
    .single();

  if (error) return { error, data: null };
  return { data, error: null };
};

export default upsertMessageMoment;
