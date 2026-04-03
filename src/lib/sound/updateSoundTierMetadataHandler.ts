import { Address, encodeFunctionData, type Hash } from 'viem';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { updateSoundTierMetadataSchema } from '@/lib/schema/updateSoundTierMetadataSchema';
import { getOrCreateSmartWallet } from '@/lib/coinbase/getOrCreateSmartWallet';
import { sendUserOperation } from '@/lib/coinbase/sendUserOperation';
import soundMetadataAbi from '@/lib/abi/soundMetadataAbi';
import { SOUND_METADATA_ADDRESS } from '@/lib/consts';

type UpdateSoundTierMetadataInput = z.infer<
  typeof updateSoundTierMetadataSchema
> & {
  artistAddress: string;
};

const updateSoundTierMetadataHandler = async ({
  artistAddress,
  collection,
  tier,
  newUri,
}: UpdateSoundTierMetadataInput): Promise<NextResponse> => {
  const smartAccount = await getOrCreateSmartWallet({
    address: artistAddress as Address,
  });

  const network = collection.chainId === 84532 ? 'base-sepolia' : 'base';

  const call = {
    to: SOUND_METADATA_ADDRESS,
    data: encodeFunctionData({
      abi: soundMetadataAbi,
      functionName: 'setBaseURI',
      args: [collection.address, tier, newUri],
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

export default updateSoundTierMetadataHandler;
