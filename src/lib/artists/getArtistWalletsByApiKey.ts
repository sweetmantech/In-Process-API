import { NextResponse } from 'next/server';
import { Address } from 'viem';
import { getAuthorizedAddressByApiKey } from '../api-keys/getAuthorizedAddressByApiKey';
import isPrivyWalletAddress from '../privy/isPrivyWalletAddress';
import selectSocialWallets from '../supabase/in_process_artist_social_wallets/selectSocialWallets';
import getFarcasterSocialWallet from './getFarcasterSocialWallet';

const getArtistWalletsByApiKey = async (token: string) => {
  const artistAddress = await getAuthorizedAddressByApiKey(token);
  const isPrivyWallet = await isPrivyWalletAddress(artistAddress);

  if (isPrivyWallet) {
    const { data: walletRows, error } = await selectSocialWallets({
      socialWallets: [artistAddress],
    });
    if (error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }
    const artist_wallet = walletRows?.[0]?.artist_address;
    const profileAddress = artist_wallet ?? artistAddress;
    const farcasterWallet = await getFarcasterSocialWallet(profileAddress);
    const social_wallets = [artistAddress, farcasterWallet].filter(
      Boolean
    ) as string[];
    return NextResponse.json({ artist_wallet, social_wallets });
  }

  const { data: walletRows, error } = await selectSocialWallets({
    artistAddress: artistAddress as Address,
  });
  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
  const socialWallet = walletRows?.[0]?.social_wallet;
  const farcasterWallet = await getFarcasterSocialWallet(artistAddress);
  const social_wallets = [socialWallet, farcasterWallet].filter(
    Boolean
  ) as string[];
  return NextResponse.json({ artist_wallet: artistAddress, social_wallets });
};

export default getArtistWalletsByApiKey;
