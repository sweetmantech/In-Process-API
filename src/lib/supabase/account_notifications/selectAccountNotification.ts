import { supabase } from '@/lib/supabase/client';

const selectAccountNotification = async (wallet: string) => {
  const { data, error } = await supabase
    .from('account_notifications')
    .select('notify_enabled, nudge_period, telegram_chat_id')
    .eq('wallet', wallet)
    .maybeSingle();
  if (error) throw error;
  return data;
};

export default selectAccountNotification;
