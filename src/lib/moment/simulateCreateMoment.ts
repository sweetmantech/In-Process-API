import { Address, encodeFunctionData } from 'viem';
import { z } from 'zod';
import { IS_TESTNET } from '@/lib/consts';
import { createMomentSchema } from '@/lib/schema/createMomentSchema';
import { create1155 } from '@/lib/zora/create1155';
import { getOrCreateSmartWallet } from '../coinbase/getOrCreateSmartWallet';
import { normalizeSplitRecipients } from '@/lib/splits/normalizeSplitRecipients';
import buildAdditionalSetupActions from './buildAdditionalSetupActions';
import { publicClient } from '@/lib/viem/publicClient';
import { prepareUserOperation } from '@/lib/coinbase/prepareUserOperation';
import parseSimulateContractError from './parseSimulateContractError';
import { processSplits } from '../splits/processSplits';

export type SimulateCreateMomentInput = z.infer<typeof createMomentSchema>;

export interface SimulateCreateMomentResult {
  contractSimulation: { success: boolean };
  userOperation: { userOpHash: string; status: string };
}

/**
 * Simulates a moment creation without submitting an onchain transaction.
 * - Step 1: simulateContract (viem) — validates contract-level logic
 * - Step 2: prepareUserOperation (CDP) — validates at AA/paymaster level
 * Throws if either step would fail.
 */
export async function simulateCreateMoment(
  input: SimulateCreateMomentInput
): Promise<SimulateCreateMomentResult> {
  const smartAccount = await getOrCreateSmartWallet({
    address: input.account as Address,
  });

  const splits = await normalizeSplitRecipients(input.splits || []);
  const { splitAddress } = await processSplits(splits, smartAccount);

  const additionalSetupActions = await buildAdditionalSetupActions({
    splits,
    smartAccountAddress: smartAccount.address,
    hasExistingContract: !!input.contract.address,
  });

  const { parameters } = await create1155({
    ...input,
    token: {
      ...input.token,
      payoutRecipient: splitAddress ?? input.token.payoutRecipient,
    },
    ...(additionalSetupActions && { additionalSetupActions }),
  });

  try {
    await publicClient.simulateContract({
      address: parameters.address,
      abi: parameters.abi,
      functionName: input.contract.address ? 'multicall' : 'createContract',
      args: parameters.args,
      account: smartAccount.address,
    });
  } catch (e) {
    throw new Error(parseSimulateContractError(e));
  }

  const functionCallData = encodeFunctionData({
    abi: parameters.abi,
    functionName: input.contract.address ? 'multicall' : 'createContract',
    args: parameters.args,
  });

  // Step 2: prepareUserOperation — AA/paymaster-level validation (no broadcast)
  const prepared = await prepareUserOperation({
    smartAccount,
    network: IS_TESTNET ? 'base-sepolia' : 'base',
    calls: [
      { to: parameters.address, data: functionCallData, value: BigInt(0) },
    ],
  });

  return {
    contractSimulation: { success: true },
    userOperation: {
      userOpHash: prepared.userOpHash,
      status: prepared.status,
    },
  };
}
