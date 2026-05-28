import { supabase } from '@/lib/supabase/client';

export interface UpdateNotificationsQuery {
  artist_id?: string;
  viewed?: boolean;
}

export async function updateNotifications({
  artist_id,
  viewed = true,
}: UpdateNotificationsQuery) {
  let query = supabase.from('in_process_notifications').update({ viewed });

  if (artist_id) {
    query = query.eq('artist_id', artist_id);
  }

  const { data, error } = await query.select('id');

  if (error) {
    return { data: null, error };
  }

  return { data, error: null };
}
