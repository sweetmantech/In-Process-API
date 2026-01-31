import { supabase } from '../client';

const selectMessage = async (messageId: string) => {
  const { data, error } = await supabase
    .from('in_process_messages')
    .select(
      `
      *,
      metadata:in_process_message_metadata!inner(*),
      moment:in_process_message_moment(
        in_process_moments(*, collection:in_process_collections(*))
      )
    `
    )
    .eq('id', messageId)
    .single();

  if (error) {
    return { data: null, error };
  }

  return { data, error };
};

export default selectMessage;
