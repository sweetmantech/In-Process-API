import { generateApiKey } from '@/lib/api-keys/generateApiKey';
import { hashApiKey } from '@/lib/api-keys/hashApiKey';
import { insertApiKey } from '@/lib/supabase/in_process_api_keys/insertApiKey';
import { PRIVY_PROJECT_SECRET } from '@/lib/consts';

const createArtistApiKeyHandler = async ({
  artistId,
  key_name,
}: {
  artistId: string;
  key_name: string;
}) => {
  const rawApiKey = generateApiKey('art_sk');
  const keyHash = hashApiKey(rawApiKey, PRIVY_PROJECT_SECRET);
  
  await insertApiKey({
    name: key_name.trim(),
    artist_id: artistId,
    key_hash: keyHash,
  });

  return Response.json({ key: rawApiKey });
};

export default createArtistApiKeyHandler;
