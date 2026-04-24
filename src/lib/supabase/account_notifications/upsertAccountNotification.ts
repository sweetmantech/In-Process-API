import { supabase } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/types';

const upsertAccountNotification = async (
  data: Database['public']['Tables']['account_notifications']['Insert']
) => {
  return supabase
    .from('account_notifications')
    .upsert(data, { onConflict: 'artist_address' });
};

export default upsertAccountNotification;
