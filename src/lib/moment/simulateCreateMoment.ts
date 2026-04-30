import { Address, encodeFunctionData, getAddress } from 'viem';
import { z } from 'zod';
import { CHAIN_ID, IS_TESTNET } from '@/lib/consts';
import { createMomentSchema } from '@/lib/schema/createMomentSchema';
import { create1155 } from '@/lib/zora/create1155';
import { getOrCreateSmartWallet } from '../coinbase/getOrCreateSmartWallet';
import { resolveSplitAddresses } from '@/lib/splits/resolveSplitAddresses';
import { getFactoryAddress } from '@/lib/protocolSdk/create/factory-addresses';
import resolvePayoutRecipient from './resolvePayoutRecipient';
import buildAdditionalSetupActions from './buildAdditionalSetupActions';
import { publicClient } from '@/lib/viem/publicClient';
import { prepareUserOperation } from '@/lib/coinbase/prepareUserOperation';
import parseSimulateContractError from './parseSimulateContractError';

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

  const resolvedSplits = await resolveSplitAddresses(input.splits || []);

  const payoutRecipient = await resolvePayoutRecipient({
    resolvedSplits,
    smartAccount,
    defaultPayoutRecipient: input.token.payoutRecipient,
  });

  const additionalSetupActions = await buildAdditionalSetupActions({
    resolvedSplits,
    smartAccountAddress: smartAccount.address,
    hasExistingContract: !!input.contract.address,
  });

  const { parameters } = await create1155({
    ...input,
    token: { ...input.token, ...(payoutRecipient && { payoutRecipient }) },
    ...(additionalSetupActions && { additionalSetupActions }),
  });

  const isNewContractByAddress =
    getAddress(parameters.address) === getAddress(getFactoryAddress(CHAIN_ID));

  const functionName = isNewContractByAddress ? 'createContract' : 'multicall';

  // Step 1: simulateContract — contract-level validation (no gas spent)
  try {
    await publicClient.simulateContract({
      address: parameters.address,
      abi: parameters.abi,
      functionName,
      args: parameters.args,
      account: smartAccount.address,
    });
  } catch (e) {
    throw new Error(parseSimulateContractError(e));
  }

  const functionCallData = encodeFunctionData({
    abi: parameters.abi,
    functionName,
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
