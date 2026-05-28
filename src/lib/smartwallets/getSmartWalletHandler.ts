import { NextResponse } from 'next/server';
import { getCanonicalSmartAccount } from '@/lib/coinbase/getCanonicalSmartAccount';

const getSmartWalletHandler = async (artistId: string) => {
  const smartAccount = await getCanonicalSmartAccount({ artistId });
  return NextResponse.json({
    address: smartAccount.address.toLowerCase(),
  });
};

export default getSmartWalletHandler;
