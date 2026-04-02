import { Address, encodeFunctionData, type Hash } from 'viem';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { updateCollectionBaseSchema } from '@/lib/schema/updateCollectionBaseSchema';
import { getOrCreateSmartWallet } from '@/lib/coinbase/getOrCreateSmartWallet';
import { sendUserOperation } from '@/lib/coinbase/sendUserOperation';
import { CHAIN_ID, IS_TESTNET } from '@/lib/consts';
import cr1155Abi from '@/lib/abi/cr1155Abi';

type UpdateCatalogCollectionMetadataInput = z.infer<
  typeof updateCollectionBaseSchema
> & {
  artistAddress: string;
};

const updateCatalogCollectionMetadataHandler = async ({
  artistAddress,
  collection,
  newUri,
}: UpdateCatalogCollectionMetadataInput): Promise<NextResponse> => {
  const smartAccount = await getOrCreateSmartWallet({
    address: artistAddress as Address,
  });

  const call = {
    to: collection.address,
    data: encodeFunctionData({
      abi: cr1155Abi,
      functionName: 'updateContractURI',
      args: [newUri],
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

export default updateCatalogCollectionMetadataHandler;
