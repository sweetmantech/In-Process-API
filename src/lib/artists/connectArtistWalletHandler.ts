import { NextResponse } from 'next/server';
import { insertSocialWallet } from '@/lib/supabase/in_process_artist_social_wallets/insertSocialWallet';

const connectArtistWalletHandler = async (
  artistWallet: string,
  socialWallet: string
) => {
  const artist_wallet_address = artistWallet.toLowerCase();
  const social_wallet_address = socialWallet.toLowerCase();

  const { error: insertError } = await insertSocialWallet({
    artist_address: artist_wallet_address,
    social_wallet: social_wallet_address,
  });
  if (insertError) throw new Error('social_wallet is connected already.');
  return NextResponse.json({ success: true });
};

export default connectArtistWalletHandler;
