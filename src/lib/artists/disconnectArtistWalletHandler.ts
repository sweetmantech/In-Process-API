import { NextResponse } from 'next/server';
import { Address } from 'viem';
import { removeSocialWallet } from '@/lib/supabase/in_process_artist_social_wallets/removeSocialWallet';

const disconnectArtistWalletHandler = async (socialWallet: string) => {
  const { error } = await removeSocialWallet({
    social_wallet: socialWallet.toLowerCase() as Address,
  });
  if (error) throw new Error('social wallet is not connected.');
  return NextResponse.json({ success: true });
};

export default disconnectArtistWalletHandler;
