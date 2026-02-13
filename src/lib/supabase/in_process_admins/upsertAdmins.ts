import { supabase } from '../client';
import { Database } from '../types';

const upsertAdmins = async ({
  admins,
}: {
  admins: Database['public']['Tables']['in_process_admins']['Insert'][];
}) => {
  const { error } = await supabase
    .from('in_process_admins')
    .upsert(admins, { onConflict: 'collection,token_id,artist_address' });
  if (error) throw error;
};

export default upsertAdmins;
