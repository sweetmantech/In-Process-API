import { supabase } from '@/lib/supabase/client';

export interface UpdateNotificationsQuery {
  wallets?: string[];
  viewed?: boolean;
}

export async function updateNotifications({
  wallets,
  viewed = true,
}: UpdateNotificationsQuery) {
  let query = supabase.from('in_process_notifications').update({ viewed });

  if (wallets?.length) {
    query = query.in('wallet', wallets);
  }

  const { data, error } = await query.select('id');

  if (error) {
    return { data: null, error };
  }

  return { data, error: null };
}
