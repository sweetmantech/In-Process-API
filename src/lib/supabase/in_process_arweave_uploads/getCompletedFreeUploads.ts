import { supabase } from '@/lib/supabase/client';
import { FREE_TIER_MAX_BYTES } from '@/lib/consts';

const getCompletedFreeUploads = async (
  artistAddress: string,
  from: string,
  to: string
) =>
  supabase
    .from('in_process_arweave_uploads')
    .select('id', { count: 'exact', head: true })
    .eq('artist_address', artistAddress.toLowerCase())
    .gte('created_at', from)
    .lt('created_at', to)
    .lte('file_size_bytes', FREE_TIER_MAX_BYTES)
    .neq('winc_cost', '0');

export default getCompletedFreeUploads;
