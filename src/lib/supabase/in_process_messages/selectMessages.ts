import { supabase } from '../client';

const selectMessages = async ({
  messageId,
  artistAddress,
  moment,
  page,
  limit,
}: {
  messageId?: string;
  artistAddress?: string;
  moment?: boolean;
  page?: number;
  limit?: number;
}) => {
  const momentJoin = moment ? '!inner' : '';
  let query = supabase
    .from('in_process_messages')
    .select(
      `*, metadata:in_process_message_metadata!inner(*), moment:in_process_message_moment${momentJoin}(in_process_moments!inner(*, collection:in_process_collections(*)))`
    );

  if (messageId) {
    query = query.eq('id', messageId);
  } else {
    if (artistAddress) {
      query = query.eq('metadata.artist_address', artistAddress);
    }

    if (page && limit) {
      query = query.range((page - 1) * limit, page * limit - 1);
    }
  }

  const { data, error } = await query;
  if (error) {
    return { data: null, error };
  }
  return { data, error };
};

export default selectMessages;
