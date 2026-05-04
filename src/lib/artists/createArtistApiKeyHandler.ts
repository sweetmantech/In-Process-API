import { generateApiKey } from '@/lib/api-keys/generateApiKey';
import { hashApiKey } from '@/lib/api-keys/hashApiKey';
import { insertApiKey } from '@/lib/supabase/in_process_api_keys/insertApiKey';
import { PRIVY_PROJECT_SECRET } from '@/lib/consts';
import { ensureArtists } from './ensureArtists';

const createArtistApiKeyHandler = async ({
  artistAddress,
  key_name,
}: {
  artistAddress: string;
  key_name: string;
}) => {
  const rawApiKey = generateApiKey('art_sk');
  const keyHash = hashApiKey(rawApiKey, PRIVY_PROJECT_SECRET);

  await ensureArtists([artistAddress.toLowerCase()]);

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
