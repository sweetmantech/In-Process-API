import { NextResponse } from 'next/server';
import { AuthMethod } from '@/types/auth';
import { getAddressesByPrivyToken } from '@/lib/privy/getAddressesByPrivyToken';
import authenticateWithApiKey from '@/lib/auth/authenticateWithApiKey';
import isPrivyWalletAddress from '@/lib/privy/isPrivyWalletAddress';
import selectSocialWallets from '@/lib/supabase/in_process_artist_social_wallets/selectSocialWallets';
import disconnectWallets from '@/lib/artists/disconnectWallets';

const disconnectArtistWalletHandler = async ({
  method,
  token,
}: {
  method: AuthMethod;
  token: string;
}) => {
  if (method === AuthMethod.Privy) {
    const { artistAddress: externalWallet, socialWallet } =
      await getAddressesByPrivyToken(token);
    if (!socialWallet) throw new Error('In*Process wallet not found');
    if (!externalWallet) throw new Error('External wallet not found');
    await disconnectWallets({
      social_wallet: socialWallet,
      external_wallet: externalWallet,
    });
    return NextResponse.json({ success: true });
  }

  const { artistAddress: walletAddress } = await authenticateWithApiKey(token);
  const isPrivySocialWallet = await isPrivyWalletAddress(walletAddress);

  if (isPrivySocialWallet) {
    const { data: socialWallets, error } = await selectSocialWallets({
      socialWallets: [walletAddress],
    });
    if (error) throw new Error(error.message);
    const externalWallet = socialWallets?.[0]?.artist_address;
    if (!externalWallet) throw new Error('External wallet not found');
    await disconnectWallets({
      social_wallet: walletAddress,
      external_wallet: externalWallet,
    });
    return NextResponse.json({ success: true });
  }

  const { data: socialWallets, error } = await selectSocialWallets({
    artistAddress: walletAddress,
  });
  if (error) throw new Error(error.message);
  const socialWallet = socialWallets?.[0]?.social_wallet;
  if (!socialWallet) throw new Error('In*Process wallet not found');
  await disconnectWallets({
    social_wallet: socialWallet,
    external_wallet: walletAddress,
  });
  return NextResponse.json({ success: true });
};

export default disconnectArtistWalletHandler;
