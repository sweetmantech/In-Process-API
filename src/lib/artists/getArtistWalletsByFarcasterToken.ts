import { NextResponse } from 'next/server';
import authenticateWithFarcasterToken from '../auth/authenticateWithFarcasterToken';
import selectArtists from '../supabase/in_process_artists/selectArtists';
import isPrivyWalletAddress from '../privy/isPrivyWalletAddress';
import selectSocialWallets from '../supabase/in_process_artist_social_wallets/selectSocialWallets';

const getArtistWalletsByFarcasterToken = async (token: string) => {
  const { artistAddress: farcasterAddress, farcasterUsername } =
    await authenticateWithFarcasterToken(token);
  const social_wallets = [farcasterAddress].filter(Boolean) as string[];

  if (!farcasterUsername) {
    return NextResponse.json({ artist_wallet: undefined, social_wallets });
  }

  const { data: profileRows, error } = await selectArtists({
    farcaster_username: farcasterUsername,
  });
  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  const profileAddress = profileRows?.[0]?.address;
  if (!profileAddress) {
    return NextResponse.json({ artist_wallet: undefined, social_wallets });
  }

  const isPrivy = await isPrivyWalletAddress(profileAddress);
  if (isPrivy) {
    const { data: walletRows, error: walletError } = await selectSocialWallets({
      socialWallets: [profileAddress],
    });
    if (walletError) {
      return NextResponse.json(
        { message: walletError.message },
        { status: 500 }
      );
    }
    return NextResponse.json({
      artist_wallet: walletRows?.[0]?.artist_address,
      social_wallets: [profileAddress, ...social_wallets],
    });
  }

  const { data: walletRows, error: walletError } = await selectSocialWallets({
    artistAddress: profileAddress,
  });
  if (walletError) {
    return NextResponse.json({ message: walletError.message }, { status: 500 });
  }
  const socialWallet = walletRows?.[0]?.social_wallet;
  return NextResponse.json({
    artist_wallet: profileAddress,
    social_wallets: [socialWallet, ...social_wallets].filter(
      Boolean
    ) as string[],
  });
};

export default getArtistWalletsByFarcasterToken;
