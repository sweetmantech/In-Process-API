import { NextResponse } from 'next/server';
import authenticateWithFarcasterToken from '../auth/authenticateWithFarcasterToken';
import selectWallets from '../supabase/in_process_wallets/selectWallets';
import isPrivyWalletAddress from '../privy/isPrivyWalletAddress';
import selectSocialWallets from '../supabase/in_process_artist_social_wallets/selectSocialWallets';

const getArtistWalletsByFarcasterToken = async (token: string) => {
  const { artistAddress: farcasterAddress } =
    await authenticateWithFarcasterToken(token);
  const social_wallets = [farcasterAddress].filter(Boolean) as string[];

  const { data: walletRows } = await selectWallets({
    address: farcasterAddress,
  });
  const profileAddress = (walletRows?.[0]?.in_process_artists as { address: string; username: string | null } | null)?.address;
  if (!profileAddress) {
    return NextResponse.json({ artist_wallet: undefined, social_wallets });
  }

  const isPrivy = await isPrivyWalletAddress(profileAddress);
  if (isPrivy) {
    const { data: swRows } = await selectSocialWallets({
      socialWallets: [profileAddress],
    });
    return NextResponse.json({
      artist_wallet: swRows?.[0]?.artist_address,
      social_wallets: [profileAddress, ...social_wallets],
    });
  }

  const { data: swRows } = await selectSocialWallets({
    artistAddress: profileAddress,
  });
  const socialWallet = swRows?.[0]?.social_wallet;
  return NextResponse.json({
    artist_wallet: profileAddress,
    social_wallets: [socialWallet, ...social_wallets].filter(
      Boolean
    ) as string[],
  });
};

export default getArtistWalletsByFarcasterToken;
