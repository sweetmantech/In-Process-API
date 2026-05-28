import { supabase } from '@/lib/supabase/client';

const selectAccountNotification = async (artistId: string) => {
  const { data, error } = await supabase
    .from('account_notifications')
    .select('notify_enabled, nudge_period, telegram_chat_id')
    .eq('artist_id', artistId)
    .maybeSingle();
  if (error) throw error;
  return data;
};

export default selectAccountNotification;
