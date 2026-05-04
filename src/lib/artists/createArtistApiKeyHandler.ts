import { generateApiKey } from '@/lib/api-keys/generateApiKey';
import { hashApiKey } from '@/lib/api-keys/hashApiKey';
import { insertApiKey } from '@/lib/supabase/in_process_api_keys/insertApiKey';
import { upsertProfile } from '@/lib/supabase/in_process_artists/upsertProfile';
import { PRIVY_PROJECT_SECRET } from '@/lib/consts';

const createArtistApiKeyHandler = async ({
  artistAddress,
  key_name,
}: {
  artistAddress: string;
  key_name: string;
}) => {
  const rawApiKey = generateApiKey('art_sk');
  const keyHash = hashApiKey(rawApiKey, PRIVY_PROJECT_SECRET);

  const { error: profileError } = await upsertProfile({
    address: artistAddress.toLowerCase(),
  });
  if (profileError) throw new Error('Failed to upsert profile');

  const { error } = await insertApiKey({
    name: key_name.trim(),
    artist_address: artistAddress.toLowerCase(),
    key_hash: keyHash,
  });

  if (error) throw new Error('Failed to store api key');

  return Response.json({
    key: rawApiKey,
  });
};

export default createArtistApiKeyHandler;
