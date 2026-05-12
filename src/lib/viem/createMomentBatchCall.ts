import { zoraCreator1155ImplABI } from '@zoralabs/protocol-deployments';
import type { z } from 'zod';
import { Address, encodeFunctionData, Hex } from 'viem';
import { ROYALTY_BPS_DEFAULT } from '@/lib/consts';
import { makeCreateContractAndTokenCall } from '@/lib/protocolSdk/create/1155-create-helper';
import { createMomentBatchSchema } from '@/lib/schema/createMomentSchema';

export interface CreateMomentBatchCallResult {
  to: Address;
  data: `0x${string}`;
}

type CreateMomentBatchCallInput = z.infer<typeof createMomentBatchSchema>;

const createMomentBatchCall = ({
  input,
  tokenSetupActions,
  fundsRecipient,
}: {
  input: CreateMomentBatchCallInput;
  tokenSetupActions: Hex[];
  fundsRecipient: Address;
}): CreateMomentBatchCallResult => {
  const { chainId, account, contract } = input;

  if (contract.address) {
    return {
      to: contract.address as Address,
      data: encodeFunctionData({
        abi: zoraCreator1155ImplABI,
        functionName: 'multicall',
        args: [tokenSetupActions],
      }),
    };
  }

  const parameters = makeCreateContractAndTokenCall({
    chainId,
    account: account as Address,
    contract: {
      name: contract.name!,
      uri: contract.uri!,
    },
    tokenSetupActions,
    fundsRecipient,
    royaltyBPS: ROYALTY_BPS_DEFAULT,
  });

  return {
    to: parameters.address,
    data: encodeFunctionData({
      abi: parameters.abi,
      functionName: parameters.functionName,
      args: parameters.args,
    }),
  };
};

export default createMomentBatchCall;
