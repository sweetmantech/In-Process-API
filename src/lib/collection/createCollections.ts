import { Address, Hash, parseEventLogs, ParseEventLogsReturnType } from 'viem';
import { z } from 'zod';
import { baseSepolia } from 'viem/chains';
import { createCollectionsSchema } from '@/lib/schema/createCollectionsSchema';
import { sendUserOperation } from '@/lib/coinbase/sendUserOperation';
import { zoraCreator1155FactoryImplABI } from '@zoralabs/protocol-deployments';
import { getOrCreateSmartWallet } from '../coinbase/getOrCreateSmartWallet';

export interface CreateCollectionResult {
  contractAddress: Address;
  hash: Hash;
  chainId: number;
}
import prepareCreateCollectionCall from './prepareCreateCollectionCall';

type CreateCollectionsInput = z.infer<typeof createCollectionsSchema>;

export async function createCollections(
  input: CreateCollectionsInput
): Promise<CreateCollectionResult[]> {
  const accountAddress = input.account as Address;

  const smartAccount = await getOrCreateSmartWallet({
    address: accountAddress,
  });

  const calls = await Promise.all(
    input.collections.map((item) =>
      prepareCreateCollectionCall(item, smartAccount, accountAddress)
    )
  );

  const transaction = await sendUserOperation({
    smartAccount,
    network: input.chainId === baseSepolia.id ? 'base-sepolia' : 'base',
    calls,
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

  return factoryLogs.map((log) => ({
    contractAddress: (log.args as { newContract: Address }).newContract,
    hash: transaction.transactionHash as Hash,
    chainId: input.chainId,
  }));
}
