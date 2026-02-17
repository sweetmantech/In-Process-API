import { NextResponse } from 'next/server';
import { Address } from 'viem';
import { getOrCreateSmartWallet } from '@/lib/coinbase/getOrCreateSmartWallet';
import { upsertProfile } from '@/lib/supabase/in_process_artists/upsertProfile';
import { insertSocialWallet } from '@/lib/supabase/in_process_artist_social_wallets/insertSocialWallet';

const connectArtistWalletHandler = async (
  artistWallet: string,
  socialWallet: string
) => {
  const artist_wallet_address = artistWallet.toLowerCase();
  const social_wallet_address = socialWallet.toLowerCase();

  const smart_wallet = await getOrCreateSmartWallet({
    address: artist_wallet_address as Address,
  });
  const { error: upsertError } = await upsertProfile({
    address: artist_wallet_address,
    smart_wallet: smart_wallet.address as Address,
  });
  const { error: insertError } = await insertSocialWallet({
    artist_address: artist_wallet_address,
    social_wallet: social_wallet_address,
  });
  if (insertError) throw new Error('social_wallet is connected already.');
  if (upsertError) throw new Error();
  return NextResponse.json({ success: true });
};

export default connectArtistWalletHandler;
