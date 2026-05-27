import { supabase } from '@/lib/supabase/client';

const getApiKeyByHash = async (keyHash: string) => {
  return supabase
    .from('in_process_api_keys')
    .select('artist_id')
    .eq('key_hash', keyHash)
    .single();
};

export default getApiKeyByHash;
