import { supabase } from '@/lib/supabase/client';

const selectAccountNotification = async ({
  wallets,
  telegram_chat_id,
}: {
  wallets?: string[];
  telegram_chat_id?: string;
}) => {
  let query = supabase
    .from('account_notifications')
    .select('wallet, notify_enabled, nudge_period, telegram_chat_id');

  if (telegram_chat_id) {
    query = query.eq('telegram_chat_id', telegram_chat_id);
  }

  if (wallets?.length) {
    query = query.in(
      'wallet',
      wallets.map((address) => address.toLowerCase())
    );
  }

  const { data, error } = await query.limit(1).maybeSingle();
  if (error) throw error;
  return data;
};

export default selectAccountNotification;
