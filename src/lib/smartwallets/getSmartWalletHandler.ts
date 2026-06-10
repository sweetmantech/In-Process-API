import { NextResponse } from 'next/server';
import { getArtistSmartAccount } from '@/lib/coinbase/getArtistSmartAccount';

const getSmartWalletHandler = async (artistId: string) => {
  const smartAccount = await getArtistSmartAccount({ artistId });
  return NextResponse.json({
    address: smartAccount.address.toLowerCase(),
  });
};

export default getSmartWalletHandler;
