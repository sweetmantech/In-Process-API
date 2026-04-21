import { supabase } from '@/lib/supabase/client';

const upsertRoom = async (id: string) => {
  return supabase
    .from('in_process_rooms')
    .upsert({ id }, { onConflict: 'id', ignoreDuplicates: true });
};

export default upsertRoom;
