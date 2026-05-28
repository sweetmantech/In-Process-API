import { deleteApiKey } from '@/lib/supabase/in_process_api_keys/deleteApiKey';

const deleteArtistApiKeyHandler = async (keyId: string) => {
  await deleteApiKey(keyId);

  return Response.json({
    message: 'API key deleted successfully',
  });
};

export default deleteArtistApiKeyHandler;
