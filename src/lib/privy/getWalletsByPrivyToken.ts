import { Address } from 'viem';
import selectWallets from '../supabase/in_process_wallets/selectWallets';
import getPrivyLinkedAccount from './getPrivyLinkedAccount';
import upsertWallets from '../supabase/in_process_wallets/upsertWallets';
import { upsertArtists } from '../supabase/in_process_artists/upsertArtists';

export async function getWalletsByPrivyToken(authToken: string): Promise<{
  primaryWallet: Address;
  wallets: Address[];
  artistId: string;
}> {
  const { linkedAccount, type } = await getPrivyLinkedAccount(authToken);

  const [upserted] = await upsertWallets([
    {
      address: linkedAccount,
      type,
    },
  ]);

  let artistId = upserted.artist_id;

  if (!artistId) {
    const [created] = await upsertArtists({});
    if (!created) throw new Error('Failed to create artist entity');
    artistId = created.id;
    await upsertWallets([{ address: linkedAccount, artist: artistId }]);
  }

  const { data: linkedWallets } = await selectWallets({
    artistIds: [artistId],
  });
  const externalWallet = linkedWallets?.find(
    (w) => w.type === 'external'
  )?.address;
  return {
    primaryWallet: (externalWallet as Address) || linkedAccount,
    wallets: linkedWallets?.map((w) => w.address as Address) || [linkedAccount],
    artistId,
  };
}
