import { supabase } from '@/lib/supabase/client';

const getCompletedUploads = async (
  artistAddress: string,
  from: string,
  to: string
) =>
  supabase
    .from('in_process_chunk_upload_sessions')
    .select('id', { count: 'exact', head: true })
    .eq('artist_address', artistAddress.toLowerCase())
    .eq('status', 'done')
    .gte('completed_at', from)
    .lt('completed_at', to);

export default getCompletedUploads;
