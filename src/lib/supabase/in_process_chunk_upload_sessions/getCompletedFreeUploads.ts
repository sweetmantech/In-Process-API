import { supabase } from '@/lib/supabase/client';
import { FREE_TIER_MAX_BYTES } from '@/lib/consts';

const getCompletedFreeUploads = async (
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
    .lt('completed_at', to)
    .or(`total_size_bytes.is.null,total_size_bytes.lte.${FREE_TIER_MAX_BYTES}`);

export default getCompletedFreeUploads;
