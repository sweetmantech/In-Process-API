import type { EvmSmartAccount } from '@coinbase/cdp-sdk';
import { Address, Hex } from 'viem';
import { z } from 'zod';
import { constructCreate1155TokenCalls } from '@/lib/protocolSdk/create/token-setup';
import { createMomentBatchSchema } from '@/lib/schema/createMomentSchema';
import getContractSetup from '@/lib/viem/getContractSetup';
import { normalizeSplitRecipients } from '@/lib/splits/normalizeSplitRecipients';
import { processSplits } from '@/lib/splits/processSplits';
import buildPermissionSetupActions from './buildPermissionSetupActions';
import createTokenParam from './createTokenParam';

export type CreateBatchSetupActionsInput = z.infer<
  typeof createMomentBatchSchema
>;

export interface BatchSetupActionsResult {
  tokenSetupActions: Hex[];
  fundsRecipient: Address;
}

const createBatchSetupActions = async ({
  input,
  smartAccount,
}: {
  input: CreateBatchSetupActionsInput;
  smartAccount: EvmSmartAccount;
}): Promise<BatchSetupActionsResult> => {
  const normalizedSplits = await normalizeSplitRecipients(input.splits || []);
  const { splitAddress } = await processSplits(normalizedSplits, smartAccount);

  const permissionSetupActions = await buildPermissionSetupActions({
    splits: normalizedSplits,
    smartAccountAddress: smartAccount.address,
  });

  const { nextTokenId, contractVersion, collectionName } =
    await getContractSetup({
      chainId: input.chainId,
      contract: input.contract,
    });

  const tokenSetupActions = input.tokens.flatMap((token, index) => {
    const tokenId = nextTokenId + BigInt(index);
    const payoutRecipient = splitAddress ?? token.payoutRecipient;
    const { setupActions: perTokenActions } = constructCreate1155TokenCalls({
      chainId: input.chainId,
      ownerAddress: input.account as Address,
      contractVersion,
      nextTokenId: tokenId,
      contractName: collectionName,
      ...createTokenParam(token, payoutRecipient),
    });

    return [...permissionSetupActions({ tokenId }), ...perTokenActions];
  });

  const fundsRecipient = (splitAddress ??
    input.tokens[0]!.payoutRecipient ??
    input.account) as Address;

  return { tokenSetupActions, fundsRecipient };
};

export default createBatchSetupActions;
