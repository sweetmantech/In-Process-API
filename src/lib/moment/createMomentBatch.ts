import { Address, Hash } from 'viem';
import { z } from 'zod';
import { getContractAddressFromReceipt } from '@/lib/protocolSdk/create/1155-create-helper';
import { createMomentBatchSchema } from '@/lib/schema/createMomentSchema';
import { sendUserOperation } from '@/lib/coinbase/sendUserOperation';
import createBatchSetupActions from './createBatchSetupActions';
import indexMoment from './indexMoment';
import getCreatedTokenIds from './getCreatedTokenIds';
import createMomentBatchCall from '@/lib/viem/createMomentBatchCall';
import { getOperationalSmartWallet } from '../smartwallets/getOperationalSmartWallet';
import getOrCreateArtist from '../artists/getOrCreateArtist';

export type CreateMomentBatchInput = z.infer<typeof createMomentBatchSchema>;

export interface CreateMomentBatchResult {
  contractAddress: Address;
  hash: Hash;
  chainId: number;
  tokenIds: string[];
}

const createMomentBatch = async (
  input: CreateMomentBatchInput
): Promise<CreateMomentBatchResult> => {
  const smartAccount = await getOperationalSmartWallet({
    artist: await getOrCreateArtist({ address: input.account as Address }),
    moment: {
      collectionAddress: input.contract.address as Address | undefined,
      chainId: input.chainId,
      tokenId: '0',
    },
  });

  const { tokenSetupActions, fundsRecipient } = await createBatchSetupActions({
    input,
    smartAccount,
  });

  const { to: callTo, data: functionCallData } = createMomentBatchCall({
    input,
    tokenSetupActions,
    fundsRecipient,
  });

  const transaction = await sendUserOperation({
    smartAccount,
    network: input.chainId === 84532 ? 'base-sepolia' : 'base',
    calls: [{ to: callTo, data: functionCallData }],
  });

  const contractAddress =
    input.contract.address || getContractAddressFromReceipt(transaction);

  const tokenIds = getCreatedTokenIds({
    logs: transaction.logs,
    contractAddress,
    tokens: input.tokens,
  });

  await Promise.all(
    tokenIds.map((tokenId, index) =>
      indexMoment({
        artistAddress: input.account as Address,
        contractAddress,
        tokenId,
        channel: input.channel,
        token: input.tokens[index],
        chainId: input.chainId,
      })
    )
  );

  return {
    contractAddress,
    hash: transaction.transactionHash as Hash,
    chainId: input.chainId,
    tokenIds,
  };
};

export default createMomentBatch;
