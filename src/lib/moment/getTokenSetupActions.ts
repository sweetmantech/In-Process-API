import { Address, Hex } from 'viem';
import { constructCreate1155TokenCalls } from '@/lib/protocolSdk/create/token-setup';
import getContractSetup from '@/lib/viem/getContractSetup';
import type { CreateMomentBatchInput } from './createMomentBatch';
import createTokenParam from './createTokenParam';

const getTokenSetupActions = async ({
  input,
  splitAddress,
  permissionSetupActions,
}: {
  input: CreateMomentBatchInput;
  splitAddress: Address | undefined;
  permissionSetupActions: (args: { tokenId: bigint }) => Hex[];
}): Promise<{ tokenSetupActions: Hex[]; firstTokenId: bigint }> => {
  const { nextTokenId, contractVersion, collectionName } = await getContractSetup({ chainId: input.chainId, contract: input.contract });

  const tokenSetupActions = input.tokens.flatMap((token, index) => {
    const tokenId = nextTokenId + BigInt(index);
    const { setupActions: perTokenActions } = constructCreate1155TokenCalls({
      chainId: input.chainId,
      ownerAddress: input.account as Address,
      contractVersion,
      nextTokenId: tokenId,
      contractName: collectionName,
      ...createTokenParam(token, splitAddress ?? token.payoutRecipient),
    });

    return [...permissionSetupActions({ tokenId }), ...perTokenActions];
  });

  return { tokenSetupActions, firstTokenId: nextTokenId };
};

export default getTokenSetupActions;
