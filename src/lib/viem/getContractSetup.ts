import type { z } from 'zod';
import { zoraCreator1155ImplABI } from '@zoralabs/protocol-deployments';
import type { Address } from 'viem';
import { new1155ContractVersion } from '@/lib/protocolSdk/create/contract-setup';
import { contractSchema } from '@/lib/schema/createMomentSchema';
import { getPublicClient } from './publicClient';

type ContractInput = z.infer<typeof contractSchema>;

export type ContractSetup = {
  nextTokenId: bigint;
  contractVersion: string;
  collectionName: string;
};

const getContractSetup = async ({
  chainId,
  contract,
}: {
  chainId: number;
  contract: ContractInput;
}): Promise<ContractSetup> => {
  if (contract.address) {
    const publicClient = getPublicClient(chainId);
    const [nextTokenIdValue, contractVersionValue, nameValue] =
      (await publicClient.multicall({
        contracts: ['nextTokenId', 'contractVersion', 'name'].map(
          (functionName) => ({
            address: contract.address as Address,
            abi: zoraCreator1155ImplABI,
            functionName,
          })
        ) as any,
      })) as any;

    return {
      nextTokenId: BigInt(nextTokenIdValue.result),
      contractVersion: contractVersionValue.result as string,
      collectionName: nameValue.result as string,
    };
  }

  return {
    nextTokenId: BigInt(1),
    contractVersion: new1155ContractVersion(chainId),
    collectionName: contract.name!,
  };
};

export default getContractSetup;
