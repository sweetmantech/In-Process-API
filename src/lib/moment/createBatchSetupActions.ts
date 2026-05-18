import type { EvmSmartAccount } from '@coinbase/cdp-sdk';
import { Address, Hex } from 'viem';
import { z } from 'zod';
import { createMomentBatchSchema } from '@/lib/schema/createMomentSchema';
import { normalizeSplitRecipients } from '@/lib/splits/normalizeSplitRecipients';
import { processSplits } from '@/lib/splits/processSplits';
import buildPermissionSetupActions from './buildPermissionSetupActions';
import getTokenSetupActions from './getTokenSetupActions';

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

  const { tokenSetupActions } = await getTokenSetupActions({
    input,
    splitAddress: splitAddress ?? undefined,
    permissionSetupActions,
  });

  const fundsRecipient = (splitAddress ??
    input.tokens[0]!.payoutRecipient ??
    input.account) as Address;

  return { tokenSetupActions, fundsRecipient };
};

export default createBatchSetupActions;
