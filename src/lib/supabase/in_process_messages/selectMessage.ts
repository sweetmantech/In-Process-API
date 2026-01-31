import { supabase } from '../client';
import { Tables } from '../types';
import { PostgrestError } from '@supabase/supabase-js';

export type MessageWithRelations = Tables<'in_process_messages'> & {
  metadata: Tables<'in_process_message_metadata'>;
  moment:
    | (Tables<'in_process_moments'> & {
        collection: Tables<'in_process_collections'>;
      })
    | null;
};

const selectMessage = async (
  messageId: string
): Promise<{
  data: MessageWithRelations | null;
  error: PostgrestError | null;
}> => {
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
