import { NextResponse } from 'next/server';
import { getAuthorizedAddressByApiKey } from '../api-keys/getAuthorizedAddressByApiKey';
import isPrivyWalletAddress from '../privy/isPrivyWalletAddress';
import selectWallets from '../supabase/in_process_wallets/selectWallets';
import getFarcasterSocialWallet from './getFarcasterSocialWallet';

const getArtistWalletsByApiKey = async (token: string) => {
  const artistAddress = await getAuthorizedAddressByApiKey(token);
  const isPrivyWallet = await isPrivyWalletAddress(artistAddress);

  if (isPrivyWallet) {
    const { data: walletRows } = await selectWallets({
      addresses: [artistAddress],
    });
    const artistId = walletRows?.[0]?.artist;
    let artist_wallet: string | undefined;
    if (artistId) {
      const { data: externalRows } = await selectWallets({
        artistIds: [artistId],
        type: 'external',
      });
      artist_wallet = externalRows?.[0]?.address;
    }
    const profileAddress = artist_wallet ?? artistAddress;
    const farcasterWallet = await getFarcasterSocialWallet(profileAddress);
    const social_wallets = [artistAddress, farcasterWallet].filter(
      Boolean
    ) as string[];
    return NextResponse.json({ artist_wallet, social_wallets });
  }

  const { data: walletRows } = await selectWallets({ addresses: [artistAddress] });
  const artistId = walletRows?.[0]?.artist;
  let socialWallet: string | undefined;
  if (artistId) {
    const { data: privyRows } = await selectWallets({
      artistIds: [artistId],
      type: 'privy',
    });
    socialWallet = privyRows?.[0]?.address;
  }
  const farcasterWallet = await getFarcasterSocialWallet(artistAddress);
  const social_wallets = [socialWallet, farcasterWallet].filter(
    Boolean
  ) as string[];
  return NextResponse.json({ artist_wallet: artistAddress, social_wallets });
};

export default getArtistWalletsByApiKey;
