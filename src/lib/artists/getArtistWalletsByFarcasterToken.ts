import { NextResponse } from 'next/server';
import authenticateWithFarcasterToken from '../auth/authenticateWithFarcasterToken';
import selectWallets from '../supabase/in_process_wallets/selectWallets';
import isPrivyWalletAddress from '../privy/isPrivyWalletAddress';

const getArtistWalletsByFarcasterToken = async (token: string) => {
  const { artistAddress: farcasterAddress } =
    await authenticateWithFarcasterToken(token);
  const social_wallets = [farcasterAddress].filter(Boolean) as string[];

  const { data: walletRows } = await selectWallets({
    addresses: [farcasterAddress],
  });
  const artistId = walletRows?.[0]?.artist;
  const profileAddress = (
    walletRows?.[0]?.in_process_artists as {
      address: string;
      username: string | null;
    } | null
  )?.address;

  if (!profileAddress || !artistId) {
    return NextResponse.json({ artist_wallet: undefined, social_wallets });
  }

  const isPrivy = await isPrivyWalletAddress(profileAddress);
  if (isPrivy) {
    const { data: externalRows } = await selectWallets({
      artistIds: [artistId],
      type: 'external',
    });
    const artist_wallet = externalRows?.[0]?.address;
    return NextResponse.json({
      artist_wallet,
      social_wallets: [profileAddress, ...social_wallets],
    });
  }

  const { data: privyRows } = await selectWallets({
    artistIds: [artistId],
    type: 'privy',
  });
  const socialWallet = privyRows?.[0]?.address;
  return NextResponse.json({
    artist_wallet: profileAddress,
    social_wallets: [socialWallet, ...social_wallets].filter(
      Boolean
    ) as string[],
  });
};

export default getArtistWalletsByFarcasterToken;
