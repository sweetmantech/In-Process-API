import { NextResponse } from 'next/server';
import type { Address } from 'viem';
import { getOrCreateSmartWallet } from '@/lib/coinbase/getOrCreateSmartWallet';

const getSmartWalletHandler = async (artist_wallet: Address) => {
  const smartAccount = await getOrCreateSmartWallet({
    address: artist_wallet,
  });
  return NextResponse.json({
    address: smartAccount.address.toLowerCase(),
  });
};

export default getSmartWalletHandler;
