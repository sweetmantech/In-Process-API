import { NextResponse } from 'next/server';
import { Address } from 'viem';
import upsertWallets from '@/lib/supabase/in_process_wallets/upsertWallets';
import selectWallets from '@/lib/supabase/in_process_wallets/selectWallets';
import deleteArtist from '@/lib/supabase/in_process_artists/deleteArtist';
import selectArtists from '@/lib/supabase/in_process_artists/selectArtists';
import { upsertArtists } from '@/lib/supabase/in_process_artists/upsertArtists';
import { WalletType } from '@/types/wallets';
import { AuthResult } from '@/types/auth';

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

  const { data: existing } = await selectWallets({
    addresses: [address.toLowerCase()],
  });
  const existingWallet = existing?.[0];

  let targetArtistId = artistId;

  if (existingWallet?.artist_id && existingWallet.artist_id !== artistId) {
    const existingArtistId = existingWallet.artist_id;

    const [{ data: profiles }, { data: existingArtistWallets }] =
      await Promise.all([
        selectArtists({ ids: [existingArtistId, artistId] }),
        selectWallets({ artistIds: [existingArtistId] }),
      ]);

    const keepCurrent = artist.wallets.some((w) => w.type === 'external');
    const [keepId, dropId, dropWallets] = keepCurrent
      ? [artistId, existingArtistId, existingArtistWallets]
      : [existingArtistId, artistId, artist.wallets];

    targetArtistId = keepId;

    const keepProfile = profiles.find((p) => p.id === keepId);
    const dropProfile = profiles.find((p) => p.id === dropId);

    if (keepProfile && dropProfile) {
      await upsertArtists({
        id: keepId,
        username: keepProfile.username ?? dropProfile.username,
        bio: keepProfile.bio ?? dropProfile.bio,
        x: keepProfile.x ?? dropProfile.x,
        instagram: keepProfile.instagram ?? dropProfile.instagram,
        telegram: keepProfile.telegram ?? dropProfile.telegram,
      });
    }

    if (dropWallets?.length) {
      await upsertWallets(
        dropWallets.map((w) => ({
          address: w.address.toLowerCase(),
          artist: keepId,
          type: w.type,
        }))
      );
    }

    await deleteArtist(dropId);
  }

  await upsertWallets([
    {
      address: address.toLowerCase(),
      artist: targetArtistId,
      type: clientType,
    },
  ]);

  return NextResponse.json({ success: true });
};

export default connectWalletHandler;
