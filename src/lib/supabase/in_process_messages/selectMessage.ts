import { supabase } from '../client';
import type { PostgrestError } from '@supabase/supabase-js';

/**
 * Latest non-empty Telegram `chat_id` for an artist, by `in_process_message_metadata.created_at`
 * (same intent as the `latest_chats` CTE in nudges / wrap-up).
 */
const selectMessage = async (
  artistAddress: string
): Promise<{
  error: PostgrestError | null;
  data: {
    chat_id: string | null;
    in_process_message_metadata: {
      created_at: string;
      artist_address: string | null;
      client: 'telegram' | 'sms' | 'web' | 'api';
    };
  } | null;
}> => {
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

  if (error) return { error, data: null };
  return { error: null, data };
};

export default selectMessage;
