import { Address, encodeFunctionData, type Hash } from 'viem';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { updateMomentURISchema } from '@/lib/schema/updateMomentURISchema';
import { getOrCreateSmartWallet } from '@/lib/coinbase/getOrCreateSmartWallet';
import { sendUserOperation } from '@/lib/coinbase/sendUserOperation';
import { CHAIN_ID, IS_TESTNET } from '@/lib/consts';
import cr1155Abi from '@/lib/abi/cr1155Abi';

type UpdateCatalogMetadataInput = z.infer<typeof updateMomentURISchema> & {
  artistAddress: string;
};

const updateCatalogMetadataHandler = async ({
  artistAddress,
  moment,
  newUri,
}: UpdateCatalogMetadataInput): Promise<NextResponse> => {
  const smartAccount = await getOrCreateSmartWallet({
    address: artistAddress as Address,
  });

  const call = {
    to: moment.collectionAddress,
    data: encodeFunctionData({
      abi: cr1155Abi,
      functionName: 'updateTokenURI',
      args: [BigInt(moment.tokenId), newUri],
    }),
  };

  const transaction = await sendUserOperation({
    smartAccount,
    network: IS_TESTNET ? 'base-sepolia' : 'base',
    calls: [call],
  });

  return NextResponse.json({
    hash: transaction.transactionHash as Hash,
    chainId: CHAIN_ID,
  });
};

export default updateCatalogMetadataHandler;
