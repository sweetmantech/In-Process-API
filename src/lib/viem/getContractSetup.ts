import { zoraCreator1155ImplABI } from '@zoralabs/protocol-deployments';
import type { Address } from 'viem';
import { CHAIN_ID } from '@/lib/consts';
import { getPublicClient } from './publicClient';

const getContractSetup = async (contractAddress: Address) => {
  const publicClient = getPublicClient(CHAIN_ID);
  const [nextTokenIdValue, contractVersionValue, nameValue] =
    (await publicClient.multicall({
      contracts: ['nextTokenId', 'contractVersion', 'name'].map(
        (functionName) => ({
          address: contractAddress,
          abi: zoraCreator1155ImplABI,
          functionName,
        })
      ) as any,
    })) as any;

  return {
    nextTokenId: nextTokenIdValue.result as bigint,
    contractVersion: contractVersionValue.result as string,
    name: nameValue.result as string,
  };
};

export default getContractSetup;
