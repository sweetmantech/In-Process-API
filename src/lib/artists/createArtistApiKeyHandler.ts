import { generateApiKey } from '@/lib/api-keys/generateApiKey';
import { hashApiKey } from '@/lib/api-keys/hashApiKey';
import { insertApiKey } from '@/lib/supabase/in_process_api_keys/insertApiKey';
import { PRIVY_PROJECT_SECRET } from '@/lib/consts';
import { supabase } from '@/lib/supabase/client';

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
  const { error: walletUpsertError } = await supabase
    .from('in_process_wallets')
    .upsert({ address }, { onConflict: 'address', ignoreDuplicates: true });
  if (walletUpsertError) throw new Error('Failed to ensure wallet row');

  // 2. Resolve the artist UUID, creating one if the wallet is not linked yet.
  const { data: walletRow } = await supabase
    .from('in_process_wallets')
    .select('artist')
    .eq('address', address)
    .single();

  let artistId = walletRow?.artist ?? null;

  if (!artistId) {
    const { data: newArtist, error: insertArtistError } = await supabase
      .from('in_process_artists')
      .insert({ address })
      .select('id')
      .single();
    if (insertArtistError || !newArtist) {
      throw new Error('Failed to create artist entity');
    }
    artistId = newArtist.id;

    // Guard against a concurrent writer having populated artist in the
    // meantime by only filling when still null.
    const { error: linkError } = await supabase
      .from('in_process_wallets')
      .update({ artist: artistId })
      .eq('address', address)
      .is('artist', null);
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
