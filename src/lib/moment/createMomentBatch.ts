import { zoraCreator1155ImplABI } from '@zoralabs/protocol-deployments';
import { Address, encodeFunctionData, Hash } from 'viem';
import { z } from 'zod';
import { CHAIN_ID, IS_TESTNET } from '@/lib/consts';
import { constructCreate1155TokenCalls } from '@/lib/protocolSdk/create/token-setup';
import { createMomentBatchSchema } from '@/lib/schema/createMomentSchema';
import { sendUserOperation } from '@/lib/coinbase/sendUserOperation';
import { getOrCreateSmartWallet } from '@/lib/coinbase/getOrCreateSmartWallet';
import { normalizeSplitRecipients } from '@/lib/splits/normalizeSplitRecipients';
import buildAdditionalSetupActions from './buildAdditionalSetupActions';
import migrateAndIndexMoment from './migrateAndIndexMoment';
import { processSplits } from '../splits/processSplits';
import getContractSetup from '../viem/getContractSetup';
import createTokenParam from './createTokenParam';
import getCreatedTokenIds from './getCreatedTokenIds';

export type CreateMomentBatchInput = z.infer<typeof createMomentBatchSchema>;

export interface CreateMomentBatchResult {
  contractAddress: Address;
  hash: Hash;
  chainId: number;
  tokenIds: string[];
}

const createMomentBatch = async (
  input: CreateMomentBatchInput
): Promise<CreateMomentBatchResult> => {
  const contractAddress = input.contract.address;
  const smartAccount = await getOrCreateSmartWallet({
    address: input.account as Address,
  });
  const { nextTokenId, contractVersion, name } =
    await getContractSetup(contractAddress);

  const normalizedSplits = await normalizeSplitRecipients(input.splits || []);
  const { splitAddress } = await processSplits(normalizedSplits, smartAccount);
  const additionalSetupActions = await buildAdditionalSetupActions({
    splits: normalizedSplits,
    smartAccountAddress: smartAccount.address,
    hasExistingContract: true,
  });

  const setupActions = input.tokens.flatMap((token, index) => {
    const tokenId = nextTokenId + BigInt(index);
    const payoutRecipient = splitAddress ?? token.payoutRecipient;
    const { setupActions: tokenSetupActions } = constructCreate1155TokenCalls({
      chainId: CHAIN_ID,
      ownerAddress: input.account as Address,
      contractVersion,
      nextTokenId: tokenId,
      contractName: name,
      ...createTokenParam(token, payoutRecipient),
    });

    return [
      ...(additionalSetupActions?.({ tokenId }) ?? []),
      ...tokenSetupActions,
    ];
  });

  const functionCallData = encodeFunctionData({
    abi: zoraCreator1155ImplABI,
    functionName: 'multicall',
    args: [setupActions],
  });

  const transaction = await sendUserOperation({
    smartAccount,
    network: IS_TESTNET ? 'base-sepolia' : 'base',
    calls: [{ to: contractAddress, data: functionCallData }],
  });

  const tokenIds = getCreatedTokenIds({
    logs: transaction.logs,
    contractAddress,
    tokens: input.tokens,
  });

  await Promise.all(
    tokenIds.map((tokenId, index) =>
      migrateAndIndexMoment({
        artistAddress: input.account as Address,
        contractAddress,
        tokenId,
        channel: input.channel,
        token: input.tokens[index],
      })
    )
  );

  return {
    contractAddress,
    hash: transaction.transactionHash as Hash,
    chainId: CHAIN_ID,
    tokenIds,
  };
};

export default createMomentBatch;
