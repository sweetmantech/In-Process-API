import { Address, encodeFunctionData, getAddress, Hash } from 'viem';
import { z } from 'zod';
import { CHAIN_ID, IS_TESTNET } from '@/lib/consts';
import { createMomentBatchSchema } from '@/lib/schema/createMomentSchema';
import { create1155 } from '@/lib/zora/create1155';
import { sendUserOperation } from '@/lib/coinbase/sendUserOperation';
import { getOrCreateSmartWallet } from '@/lib/coinbase/getOrCreateSmartWallet';
import { resolveSplitAddresses } from '@/lib/splits/resolveSplitAddresses';
import buildAdditionalSetupActions from './buildAdditionalSetupActions';
import indexMoment from './indexMoment';
import migrateMuxToArweave from '@/workflows/migrateMuxToArweave';
import parseSetupNewTokenEventsOnContract from './parseSetupNewTokenEventsOnContract';
import resolvePayoutRecipient from './resolvePayoutRecipient';
import { createMoment } from './createMoment';

export type CreateMomentBatchInput = z.infer<typeof createMomentBatchSchema>;

export interface CreateMomentBatchResult {
  contractAddress: Address;
  hash: Hash;
  tokenId: string;
  chainId: number;
}

const createMomentBatch = async (
  input: CreateMomentBatchInput
): Promise<CreateMomentBatchResult[]> => {
  if (input.tokens.length === 0) return [];

  if (!input.contract.address) {
    const [firstToken, ...remainingTokens] = input.tokens;
    const firstResult = await createMoment({
      contract: input.contract,
      token: firstToken,
      account: input.account,
      splits: input.splits,
      channel: input.channel,
    });

    if (remainingTokens.length === 0) return [firstResult];

    const remainingResults = await createMomentBatch({
      ...input,
      contract: { address: firstResult.contractAddress },
      tokens: remainingTokens,
    });

    return [firstResult, ...remainingResults];
  }

  const contractAddress = getAddress(input.contract.address);
  const smartAccount = await getOrCreateSmartWallet({
    address: input.account as Address,
  });
  const resolvedSplits = await resolveSplitAddresses(input.splits || []);
  const additionalSetupActions = await buildAdditionalSetupActions({
    resolvedSplits,
    smartAccountAddress: smartAccount.address,
    hasExistingContract: true,
  });

  const allParameters = await Promise.all(
    input.tokens.map(async (token) => {
      const payoutRecipient = await resolvePayoutRecipient({
        resolvedSplits,
        smartAccount,
        defaultPayoutRecipient: token.payoutRecipient,
      });

      return create1155({
        contract: { address: contractAddress },
        token: { ...token, ...(payoutRecipient && { payoutRecipient }) },
        account: input.account,
        splits: input.splits,
        channel: input.channel,
        ...(additionalSetupActions && { additionalSetupActions }),
      });
    })
  );

  const calls = allParameters.map(({ parameters }) => ({
    to: parameters.address,
    data: encodeFunctionData({
      abi: parameters.abi,
      functionName: 'multicall',
      args: parameters.args,
    }),
  }));

  const transaction = await sendUserOperation({
    smartAccount,
    network: IS_TESTNET ? 'base-sepolia' : 'base',
    calls,
  });

  const remainingParsedResults = parseSetupNewTokenEventsOnContract(
    transaction.logs,
    contractAddress
  );

  if (remainingParsedResults.length < input.tokens.length) {
    throw new Error('Not all batch tokens were found in transaction logs');
  }

  const results = input.tokens.map((token) => {
    const resultIndex = remainingParsedResults.findIndex(
      (result) => result.uri === token.tokenMetadataURI
    );
    if (resultIndex === -1) {
      throw new Error(
        `SetupNewToken event not found for URI ${token.tokenMetadataURI}`
      );
    }

    const [result] = remainingParsedResults.splice(resultIndex, 1);
    return {
      contractAddress: result.contractAddress,
      tokenId: result.tokenId,
      hash: transaction.transactionHash as Hash,
      chainId: CHAIN_ID,
    };
  });

  await Promise.all(
    results.map((result, index) =>
      Promise.all([
        migrateMuxToArweave({
          artistAddress: input.account as Address,
          moment: {
            collectionAddress: result.contractAddress,
            tokenId: result.tokenId,
            chainId: CHAIN_ID,
          },
          uri: input.tokens[index].tokenMetadataURI,
        }),
        indexMoment({
          contractAddress: result.contractAddress,
          tokenId: result.tokenId,
          artistAddress: input.account,
          channel: input.channel,
          contract: { address: contractAddress },
          token: input.tokens[index],
        }),
      ])
    )
  );

  return results;
};

export default createMomentBatch;
