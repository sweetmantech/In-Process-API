import { NextResponse } from 'next/server';
import { AuthMethod } from '@/types/auth';
import { getAddressesByAuthToken } from '../privy/getAddressesByAuthToken';
import isPrivyWalletAddress from '../privy/isPrivyWalletAddress';
import { getArtistAddressByApiKey } from '../api-keys/getArtistAddressByApiKey';
import authenticateWithFarcasterToken from '../auth/authenticateWithFarcasterToken';
import getArtistAddresses from '../supabase/in_process_artist_social_wallets/getArtistAddresses';
import { selectSocialWallets } from '../supabase/in_process_artist_social_wallets/selectSocialWallets';
import { Address } from 'viem';

const getArtistWalletHandler = async ({
  method,
  token,
}: {
  method: AuthMethod;
  token: string;
}) => {
  if (method === AuthMethod.Privy) {
    const { artistAddress, socialWallet } =
      await getAddressesByAuthToken(token);
    return NextResponse.json({
      artist_wallet: artistAddress,
      social_wallet: socialWallet,
    });
  }
  if (method === AuthMethod.Farcaster) {
    const { artistAddress } = await authenticateWithFarcasterToken(token);
    const { data: walletRows, error } = await selectSocialWallets({
      artistAddress: artistAddress as Address,
    });
    if (error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }
    const socialWallet = walletRows?.[0]?.social_wallet;
    return NextResponse.json({
      artist_wallet: artistAddress,
      social_wallet: socialWallet,
    });
  }

  const artistAddress = await getArtistAddressByApiKey(token);
  const isPrivyWallet = await isPrivyWalletAddress(artistAddress);
  if (isPrivyWallet) {
    const { data: walletRows, error } = await getArtistAddresses([
      artistAddress,
    ]);
    if (error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }
    return NextResponse.json({
      artist_wallet: walletRows?.[0]?.artist_address,
      social_wallet: artistAddress,
    });
  }

  const { data: walletRows, error } = await selectSocialWallets({
    artistAddress: artistAddress as Address,
  });
  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
  const socialWallet = walletRows?.[0]?.social_wallet;
  return NextResponse.json({
    artist_wallet: artistAddress,
    social_wallet: socialWallet,
  });
};

export default getArtistWalletHandler;
