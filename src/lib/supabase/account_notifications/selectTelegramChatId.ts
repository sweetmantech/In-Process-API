import { supabase } from '@/lib/supabase/client';

const selectTelegramChatId = async (artistAddress: string) => {
  return supabase
    .from('account_notifications')
    .select('telegram_chat_id')
    .eq('artist_address', artistAddress.toLowerCase())
    .maybeSingle();
};

export default selectTelegramChatId;
