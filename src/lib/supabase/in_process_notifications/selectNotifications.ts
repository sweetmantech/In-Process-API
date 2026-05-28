import { supabase } from '@/lib/supabase/client';
export type {
  InProcessNotification,
  InProcessNotificationTransfer,
} from '@/types/notification';

export interface InProcessNotificationsQuery {
  limit?: number;
  page?: number;
  artist_id?: string;
  viewed?: boolean;
}

export async function selectNotifications({
  limit = 20,
  page = 1,
  artist_id,
  viewed,
}: InProcessNotificationsQuery = {}) {
  const cappedLimit = Math.min(limit, 100);

  let query = supabase
    .from('in_process_notifications')
    .select(
      `id, viewed,
       transfer:in_process_transfers!inner(
         value, currency, transaction_hash, transferred_at,
         moment:in_process_moments!inner(
           token_id,
           collection:in_process_collections!inner(address),
           metadata:in_process_metadata(image, name)
         ),
         collector:in_process_artists!inner(username)
       ),
       artist:in_process_artists!in_process_notifications_artist_id_fkey(username)`,
      { count: 'exact' }
    )
    .order('created_at', { ascending: false })
    .range((page - 1) * cappedLimit, page * cappedLimit - 1);

  if (artist_id) query = query.eq('artist_id', artist_id);
  if (viewed !== undefined) query = query.eq('viewed', viewed);

  const { data, count, error } = await query;
  if (error) return { data: null, count: null, error };

  return { data, count, error: null };
}
