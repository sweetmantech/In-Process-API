import { supabase } from '../client';

const selectMessageMetadatas = async ({
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
    .from('in_process_message_metadata')
    .select(
      `*, messages:in_process_messages!inner(*, moment:in_process_message_moment${momentJoin}(in_process_moments!inner(*, collection:in_process_collections(*))))`,
      { count: 'exact' }
    )
    .order('created_at', { ascending: false });

  if (messageId) {
    query = query.eq('messages.id', messageId);
  } else {
    if (artistAddress) {
      query = query.eq('artist_address', artistAddress);
    }

    if (limit) {
      const p = page ?? 1;
      query = query.range((p - 1) * limit, p * limit - 1);
    }
  }

  const { data, error, count } = await query;
  if (error) {
    return { data: null, error, count: null };
  }

  return { data, error, count };
};

export default selectMessageMetadatas;
