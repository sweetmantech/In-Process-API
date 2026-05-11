import { Address, encodeFunctionData, Hash } from 'viem';
import { z } from 'zod';
import { CHAIN_ID, IS_TESTNET } from '@/lib/consts';
import { createMomentSchema } from '@/lib/schema/createMomentSchema';
import { create1155 } from '@/lib/zora/create1155';
import { sendUserOperation } from '@/lib/coinbase/sendUserOperation';
import { getOrCreateSmartWallet } from '../coinbase/getOrCreateSmartWallet';
import { normalizeSplitRecipients } from '@/lib/splits/normalizeSplitRecipients';
import parseMomentTransaction from './parseMomentTransaction';
import migrateMuxToArweave from '@/workflows/migrateMuxToArweave';
import buildAdditionalSetupActions from './buildAdditionalSetupActions';
import indexMoment from './indexMoment';
import { processSplits } from '../splits/processSplits';

export type CreateMomentContractInput = z.infer<typeof createMomentSchema>;

export interface CreateContractResult {
  contractAddress: Address;
  hash: Hash;
  tokenId: string;
  chainId: number;
}

/**
 * Creates a new In Process moment using a smart account via Coinbase CDP.
 * Accepts the full API input shape for creating a Moment.
 * Handles splits configuration by creating split contract if needed.
 */
export async function createMoment(
  input: CreateMomentContractInput
): Promise<CreateContractResult> {
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

  const functionCallData = encodeFunctionData({
    abi: parameters.abi,
    functionName: input.contract.address ? 'multicall' : 'createContract',
    args: parameters.args,
  });

  const transaction = await sendUserOperation({
    smartAccount,
    network: IS_TESTNET ? 'base-sepolia' : 'base',
    calls: [{ to: parameters.address, data: functionCallData }],
  });

  const { contractAddress, tokenId } = parseMomentTransaction({
    logs: transaction.logs,
    existingContractAddress: input.contract.address,
  });

  migrateMuxToArweave({
    artistAddress: input.account as Address,
    moment: { collectionAddress: contractAddress, tokenId, chainId: CHAIN_ID },
    uri: input.token.tokenMetadataURI,
  });

  await indexMoment({
    contractAddress,
    tokenId,
    artistAddress: input.account,
    channel: input.channel,
    contract: input.contract,
    token: input.token,
  });

  return {
    contractAddress,
    tokenId,
    hash: transaction.transactionHash as Hash,
    chainId: CHAIN_ID,
  };
}
