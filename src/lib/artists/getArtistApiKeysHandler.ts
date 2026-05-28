import { getApiKeys } from '@/lib/supabase/in_process_api_keys/getApiKeys';

const getArtistApiKeysHandler = async ({ artistId }: { artistId: string }) => {
  const keys = await getApiKeys({ artistId });

  return Response.json({ keys });
};

export default getArtistApiKeysHandler;
