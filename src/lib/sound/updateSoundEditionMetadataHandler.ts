import { Address, encodeFunctionData, type Hash } from 'viem';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { updateCollectionBaseSchema } from '@/lib/schema/updateCollectionBaseSchema';
import { getOrCreateSmartWallet } from '@/lib/coinbase/getOrCreateSmartWallet';
import { sendUserOperation } from '@/lib/coinbase/sendUserOperation';
import soundEditionAbi from '@/lib/abi/soundEditionAbi';

type UpdateSoundEditionMetadataInput = z.infer<
  typeof updateCollectionBaseSchema
> & {
  artistAddress: string;
};

const updateSoundEditionMetadataHandler = async ({
  artistAddress,
  collection,
  newUri,
}: UpdateSoundEditionMetadataInput): Promise<NextResponse> => {
  const smartAccount = await getOrCreateSmartWallet({
    address: artistAddress as Address,
  });

  const network = collection.chainId === 84532 ? 'base-sepolia' : 'base';

  const call = {
    to: collection.address,
    data: encodeFunctionData({
      abi: soundEditionAbi,
      functionName: 'setContractURI',
      args: [newUri],
    }),
  };

  const transaction = await sendUserOperation({
    smartAccount,
    network,
    calls: [call],
  });

  return NextResponse.json({
    hash: transaction.transactionHash as Hash,
    chainId: collection.chainId,
  });
};

export default updateSoundEditionMetadataHandler;
