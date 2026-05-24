import { NextResponse } from 'next/server';
import { getAddressesByPrivyToken } from '../privy/getAddressesByPrivyToken';
import getFarcasterSocialWallet from './getFarcasterSocialWallet';

const getArtistWalletsByPrivyToken = async (token: string) => {
  const { artistAddress, socialWallet } = await getAddressesByPrivyToken(token);
  const profileAddress = artistAddress ?? socialWallet;
  const farcasterWallet = profileAddress
    ? await getFarcasterSocialWallet(profileAddress)
    : undefined;
  const social_wallets = [socialWallet, farcasterWallet].filter(
    Boolean
  ) as string[];
  return NextResponse.json({ artist_wallet: artistAddress, social_wallets });
};

export default getArtistWalletsByPrivyToken;
