import { getApiKeys } from '@/lib/supabase/in_process_api_keys/getApiKeys';
import { supabase } from '@/lib/supabase/client';

const getArtistApiKeysHandler = async (artistAddress: string) => {
  const { data: walletRow } = await supabase
    .from('in_process_wallets')
    .select('artist')
    .eq('address', artistAddress.toLowerCase())
    .single();

  const { data, error } = await getApiKeys(walletRow?.artist ?? null);

  if (error) throw new Error('Failed to fetch API keys');

  return Response.json({
    keys: data || [],
  });
};

export default getArtistApiKeysHandler;
