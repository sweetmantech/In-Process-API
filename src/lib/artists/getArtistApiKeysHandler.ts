import { getApiKeys } from '@/lib/supabase/in_process_api_keys/getApiKeys';

const getArtistApiKeysHandler = async (artistAddress: string) => {
  const { data, error } = await getApiKeys(artistAddress);

  if (error) throw new Error('Failed to fetch API keys');

  return Response.json({
    keys: data || [],
  });
};

export default getArtistApiKeysHandler;
