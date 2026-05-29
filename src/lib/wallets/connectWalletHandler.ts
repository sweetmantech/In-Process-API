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

  const { data: existing } = await selectWallets({
    addresses: [address.toLowerCase()],
  });
  const existingWallet = existing?.[0];

  if (existingWallet?.artist_id && existingWallet.artist_id !== artistId) {
    const existingArtistId = existingWallet.artist_id;

    const { data: profiles } = await selectArtists({
      ids: [existingArtistId, artistId],
    });

    const existingProfile = profiles.find((p) => p.id === existingArtistId);
    const artistProfile = profiles.find((p) => p.id === artistId);

    const isExistingPrimaryWallet =
      getPrimaryWallet(existingProfile?.wallets) === address.toLowerCase();

    if (existingProfile && artistProfile && isExistingPrimaryWallet) {
      await upsertArtists({
        id: artistId,
        username: existingProfile.username ?? artistProfile.username,
        bio: existingProfile.bio ?? artistProfile.bio,
        x: existingProfile.x ?? artistProfile.x,
        instagram: existingProfile.instagram ?? artistProfile.instagram,
        telegram: existingProfile.telegram ?? artistProfile.telegram,
      });
      await upsertArtists({
        id: existingArtistId,
        username: null,
        bio: null,
        x: null,
        instagram: null,
        telegram: null,
      });
    }

    if (existing.length <= 1) await deleteArtist(existingArtistId);
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
