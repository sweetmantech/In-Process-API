import { NextResponse } from 'next/server';
import { Address } from 'viem';
import upsertWallets from '@/lib/supabase/in_process_wallets/upsertWallets';
import selectWallets from '@/lib/supabase/in_process_wallets/selectWallets';
import deleteArtist from '@/lib/supabase/in_process_artists/deleteArtist';
import selectArtists from '@/lib/supabase/in_process_artists/selectArtists';
import { upsertArtists } from '@/lib/supabase/in_process_artists/upsertArtists';
import { WalletType } from '@/types/wallets';
import { AuthResult } from '@/types/auth';
import getPrimaryWallet from './getPrimaryWallet';

const connectWalletHandler = async ({
  artist,
  address,
  clientType,
}: {
  artist: AuthResult;
  address: Address;
  clientType: WalletType;
}) => {
  const { artistId } = artist;

  const { data: walletRows } = await selectWallets({
    addresses: [address.toLowerCase()],
  });
  const incomingWallet = walletRows?.[0];

  if (incomingWallet?.artist_id && incomingWallet.artist_id !== artistId) {
    const priorArtistId = incomingWallet.artist_id;

    const { data: profiles } = await selectArtists({
      ids: [priorArtistId, artistId],
    });

    const priorProfile = profiles.find((p) => p.id === priorArtistId);
    const artistProfile = profiles.find((p) => p.id === artistId);

    if (priorProfile && artistProfile && clientType === 'external') {
      await upsertArtists({
        id: artistId,
        username: priorProfile.username ?? artistProfile.username,
        bio: priorProfile.bio ?? artistProfile.bio,
        x: priorProfile.x ?? artistProfile.x,
        instagram: priorProfile.instagram ?? artistProfile.instagram,
        telegram: priorProfile.telegram ?? artistProfile.telegram,
      });
      await upsertArtists({
        id: priorArtistId,
        username: null,
        bio: null,
        x: null,
        instagram: null,
        telegram: null,
      });
    }

    if (walletRows.length <= 1) await deleteArtist(priorArtistId);
  }

  await upsertWallets([
    {
      address: address.toLowerCase(),
      artist: artistId,
      type: clientType,
    },
  ]);

  return NextResponse.json({ success: true });
};

export default connectWalletHandler;
