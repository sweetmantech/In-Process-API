import { supabase } from '@/lib/supabase/client';

const selectAccountNotification = async (artistAddress: string) => {
  const { data, error } = await supabase
    .from('account_notifications')
    .select('notify_enabled, nudge_period, telegram_chat_id')
    .eq('artist_address', artistAddress)
    .maybeSingle();
  if (error) throw error;
  return data;
};

export default selectAccountNotification;
