import { supabase } from '../client';
import { TablesInsert } from '../types';

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
    .select()
    .single();

  if (error) return { error, data: null };
  return { data, error: null };
};

export default upsertMessageMoment;
