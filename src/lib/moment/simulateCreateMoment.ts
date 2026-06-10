import type { Address } from 'viem';
import {
  createMomentBatchSchema,
  type CreateMomentContractInput,
} from '@/lib/schema/createMomentSchema';
import type { CreateMomentBatchInput } from '@/lib/moment/createMomentBatch';
import { getWalletSmartAccount } from '@/lib/coinbase/getWalletSmartAccount';
import createBatchSetupActions from './createBatchSetupActions';
import createMomentBatchCall from '@/lib/viem/createMomentBatchCall';
import { publicClient } from '@/lib/viem/publicClient';
import { prepareUserOperation } from '@/lib/coinbase/prepareUserOperation';
import { parseSimulateCallError } from './parseSimulateContractError';

export type SimulateCreateMomentInput = CreateMomentContractInput;

export interface SimulateCreateMomentResult {
  contractSimulation: { success: boolean };
  userOperation: { userOpHash: string; status: string };
}

/**
 * Simulates batch moment creation (same calldata path as createMomentBatch) without broadcasting.
 * - Step 1: eth_call via publicClient.call — contract-level validation
 * - Step 2: prepareUserOperation (CDP) — AA/paymaster-level validation
 */
export async function simulateCreateMomentBatch(
  input: CreateMomentBatchInput
): Promise<SimulateCreateMomentResult> {
  const smartAccount = await getWalletSmartAccount({
    address: input.account as Address,
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

  try {
    await publicClient.call({
      account: smartAccount.address,
      to: callTo,
      data: functionCallData,
    });
  } catch (e) {
    throw new Error(parseSimulateCallError(e));
  }

  const prepared = await prepareUserOperation({
    smartAccount,
    network: input.chainId === 84532 ? 'base-sepolia' : 'base',
    calls: [{ to: callTo, data: functionCallData, value: BigInt(0) }],
  });

  return {
    contractSimulation: { success: true },
    userOperation: {
      userOpHash: prepared.userOpHash,
      status: prepared.status,
    },
  };
}

/**
 * Single-token create body → validated batch input → {@link simulateCreateMomentBatch}.
 */
export async function simulateCreateMoment(
  input: CreateMomentContractInput
): Promise<SimulateCreateMomentResult> {
  const batchInput = createMomentBatchSchema.parse({
    contract: input.contract,
    tokens: [input.token],
    account: input.account,
    splits: input.splits,
    channel: input.channel,
    chainId: input.chainId,
  });
  return simulateCreateMomentBatch(batchInput);
}
