import { supabase } from '../client';

/**
 * Latest non-empty Telegram `chat_id` for an artist, by `in_process_message_metadata.created_at`
 * (same intent as the `latest_chats` CTE in nudges / wrap-up).
 */
const selectChatId = async (artistAddress: string): Promise<string | null> => {
  const { data, error } = await supabase
    .from('in_process_messages')
    .select(
      'chat_id, in_process_message_metadata!inner(created_at, artist_address, client)'
    )
    .eq('in_process_message_metadata.artist_address', artistAddress)
    .eq('in_process_message_metadata.client', 'telegram')
    .not('chat_id', 'is', null)
    .neq('chat_id', '')
    .order('created_at', {
      foreignTable: 'in_process_message_metadata',
      ascending: false,
    })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('selectChatId:', error.message);
    return null;
  }
  return data?.chat_id && data.chat_id !== '' ? data.chat_id : null;
};

export default selectChatId;
