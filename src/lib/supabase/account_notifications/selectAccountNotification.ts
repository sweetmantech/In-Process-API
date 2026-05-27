import { supabase } from '@/lib/supabase/client';

const selectAccountNotification = async (artistAddress: string) => {
  return supabase
    .from('account_notifications')
    .select('notify_enabled, nudge_period, telegram_chat_id')
    .eq('artist_address', artistAddress)
    .maybeSingle();
};

export default selectAccountNotification;
