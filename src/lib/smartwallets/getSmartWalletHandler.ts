import { NextResponse } from 'next/server';
import type { Address } from 'viem';
import getSmartWalletAddress from './getSmartWalletAddress';

const getSmartWalletHandler = async (artist_wallet: Address) => {
  const smartWalletAddress = await getSmartWalletAddress(artist_wallet);
  return NextResponse.json({
    address: smartWalletAddress.toLowerCase(),
  });
};

export default getSmartWalletHandler;
