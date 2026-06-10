import { Address, Hash, parseEventLogs, ParseEventLogsReturnType } from 'viem';
import { z } from 'zod';
import { baseSepolia } from 'viem/chains';
import { createCollectionSchema } from '@/lib/schema/createCollectionSchema';
import { sendUserOperation } from '@/lib/coinbase/sendUserOperation';
import { zoraCreator1155FactoryImplABI } from '@zoralabs/protocol-deployments';
import prepareCreateCollectionCall from './prepareCreateCollectionCall';
import getOrCreateArtist from '@/lib/artists/getOrCreateArtist';
import { getCanonicalSmartAccount } from '@/lib/coinbase/getCanonicalSmartAccount';

export interface CreateCollectionResult {
  contractAddress: Address;
  hash: Hash;
  chainId: number;
}

type CreateCollectionInput = z.infer<typeof createCollectionSchema>;

export async function createCollection(
  input: CreateCollectionInput
): Promise<CreateCollectionResult> {
  const { artistId } = await getOrCreateArtist({
    address: input.account,
  });

  const smartAccount = await getCanonicalSmartAccount({ artistId });

  const call = await prepareCreateCollectionCall(
    input.collection,
    input.chainId,
    input.account,
    smartAccount
  );

  const transaction = await sendUserOperation({
    smartAccount,
    network: input.chainId === baseSepolia.id ? 'base-sepolia' : 'base',
    calls: [call],
  });

  const factoryLogs = parseEventLogs({
    abi: zoraCreator1155FactoryImplABI,
    logs: transaction.logs,
    eventName: 'SetupNewContract',
  }) as ParseEventLogsReturnType;

  if (!factoryLogs || factoryLogs.length === 0) {
    throw new Error(
      'Failed to find SetupNewContract event in transaction logs'
    );
  }

  return {
    contractAddress: (factoryLogs[0].args as { newContract: Address })
      .newContract,
    hash: transaction.transactionHash as Hash,
    chainId: input.chainId,
  };
}
