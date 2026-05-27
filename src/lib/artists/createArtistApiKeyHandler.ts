import { generateApiKey } from '@/lib/api-keys/generateApiKey';
import { hashApiKey } from '@/lib/api-keys/hashApiKey';
import { insertApiKey } from '@/lib/supabase/in_process_api_keys/insertApiKey';
import insertArtist from '@/lib/supabase/in_process_artists/insertArtist';
import linkWalletToArtist from '@/lib/supabase/in_process_wallets/linkWalletToArtist';
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
  let artistId = walletRows?.[0]?.artist ?? null;

  if (!artistId) {
    const { data: newArtist, error: insertArtistError } = await insertArtist({
      address,
    });
    if (insertArtistError || !newArtist) {
      throw new Error('Failed to create artist entity');
    }
    artistId = newArtist.id;

    const { error: linkError } = await linkWalletToArtist(address, artistId);
    if (linkError) throw new Error('Failed to link wallet to artist');
  }

  const { error } = await insertApiKey({
    name: key_name.trim(),
    artist_id: artistId,
    key_hash: keyHash,
  });

  if (error) throw new Error('Failed to store api key');

  return Response.json({
    key: rawApiKey,
  });
};

export default createArtistApiKeyHandler;
