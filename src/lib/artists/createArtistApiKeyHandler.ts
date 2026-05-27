import { generateApiKey } from '@/lib/api-keys/generateApiKey';
import { hashApiKey } from '@/lib/api-keys/hashApiKey';
import { insertApiKey } from '@/lib/supabase/in_process_api_keys/insertApiKey';
import { upsertArtists } from '@/lib/supabase/in_process_artists/upsertArtists';
import selectWallets from '@/lib/supabase/in_process_wallets/selectWallets';
import upsertWallets from '@/lib/supabase/in_process_wallets/upsertWallets';
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
  const address = artistAddress.toLowerCase();

  // 1. Ensure a wallet row exists for the address (no-op if already present).
  await upsertWallets([{ address }], { ignoreDuplicates: true });

  // 2. Resolve the artist UUID, creating one if the wallet is not linked yet.
  const { data: walletRows } = await selectWallets({ addresses: [address] });
  let artistId = walletRows?.[0]?.artist_id ?? null;

  if (!artistId) {
    const [created] = await upsertArtists({ address });
    if (!created) throw new Error('Failed to create artist entity');
    artistId = created.id;

    await upsertWallets([{ address, artist: artistId }]);
  }

  await insertApiKey({
    name: key_name.trim(),
    artist_id: artistId,
    key_hash: keyHash,
  });

  return Response.json({ key: rawApiKey });
};

export default createArtistApiKeyHandler;
