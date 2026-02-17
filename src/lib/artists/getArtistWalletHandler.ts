import { NextResponse } from 'next/server';
import getArtistAddresses from '@/lib/supabase/in_process_artist_social_wallets/getArtistAddresses';

const getArtistWalletHandler = async (socialWallet: string) => {
  const { data: walletRows, error } = await getArtistAddresses([
    socialWallet.toLowerCase(),
  ]);
  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
  const artist_address = walletRows?.[0]?.artist_address;
  if (!artist_address) throw new Error('artist is not connected.');
  return NextResponse.json({ address: artist_address });
};

export default getArtistWalletHandler;
