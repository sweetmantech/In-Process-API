import { deleteApiKey } from '@/lib/supabase/in_process_api_keys/deleteApiKey';

const deleteArtistApiKeyHandler = async (keyId: string) => {
  const { error } = await deleteApiKey(keyId);

  if (error) throw new Error('Failed to delete API key');

  return Response.json({
    message: 'API key deleted successfully',
  });
};

export default deleteArtistApiKeyHandler;
