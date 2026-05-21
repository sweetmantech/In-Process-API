import { NextResponse } from 'next/server';
import { Address } from 'viem';
import { AuthResult } from '@/types/auth';
import { removeSocialWallet } from '@/lib/supabase/in_process_artist_social_wallets/removeSocialWallet';

const disconnectArtistWalletHandler = async (auth: AuthResult) => {
  if (auth.socialWallet) {
    const { error } = await removeSocialWallet({
      social_wallet: auth.socialWallet!.toLowerCase() as Address,
    });
    if (error) throw new Error('social wallet is not connected.');
    return NextResponse.json({ success: true });
  }

  const { error } = await removeSocialWallet({
    artist_address: auth.artistAddress!.toLowerCase() as Address,
  });
  if (error) throw new Error('artist wallet is not connected.');
  return NextResponse.json({ success: true });
};

export default disconnectArtistWalletHandler;
