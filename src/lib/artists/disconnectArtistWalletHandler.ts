import { NextResponse } from 'next/server';
import { AuthMethod } from '@/types/auth';
import { getAddressesByPrivyToken } from '@/lib/privy/getAddressesByPrivyToken';
import authenticateWithApiKey from '@/lib/auth/authenticateWithApiKey';
import isPrivyWalletAddress from '@/lib/privy/isPrivyWalletAddress';
import selectWallets from '@/lib/supabase/in_process_wallets/selectWallets';
import selectArtists from '@/lib/supabase/in_process_artists/selectArtists';
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
    const { data: walletRows } = await selectWallets({
      addresses: [walletAddress],
    });
    const artistId = walletRows?.[0]?.artist_id;
    if (!artistId) throw new Error('External wallet not found');
    const { data: externalRows } = await selectWallets({
      artistIds: [artistId],
      type: 'external',
    });
    const externalWallet = externalRows?.[0]?.address;
    if (!externalWallet) throw new Error('External wallet not found');
    await disconnectWallets({
      social_wallet: walletAddress,
      external_wallet: externalWallet,
    });
    return NextResponse.json({ success: true });
  }

  const { data: artists } = await selectArtists({ address: walletAddress });
  const artistId = artists?.[0]?.id;
  if (!artistId) throw new Error('Artist not found');
  const { data: privyRows } = await selectWallets({
    artistIds: [artistId],
    type: 'privy',
  });
  const socialWallet = privyRows?.[0]?.address;
  if (!socialWallet) throw new Error('In*Process wallet not found');
  await disconnectWallets({
    social_wallet: socialWallet,
    external_wallet: walletAddress,
  });
  return NextResponse.json({ success: true });
};

export default disconnectArtistWalletHandler;
