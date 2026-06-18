import { type Address } from 'viem';
import { NextResponse } from 'next/server';
import { getArtistSmartAccount } from '@/lib/coinbase/getArtistSmartAccount';
import { getWalletSmartAccount } from '@/lib/coinbase/getWalletSmartAccount';

type GetSmartWalletParams = {
  accountId?: string;
  walletAddress?: string;
};

const getSmartWalletHandler = async ({
  accountId,
  walletAddress,
}: GetSmartWalletParams) => {
  const smartAccount = accountId
    ? await getArtistSmartAccount({ artistId: accountId })
    : await getWalletSmartAccount({ address: walletAddress as Address });

  return NextResponse.json({
    address: smartAccount.address.toLowerCase(),
  });
};

export default getSmartWalletHandler;
