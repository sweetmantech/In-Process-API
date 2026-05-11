import {
  encodeFunctionData,
  getAddress,
  maxUint64,
  parseUnits,
  type Address,
} from 'viem';
import {
  CHAIN_ID,
  IS_TESTNET,
  REFERRAL_RECIPIENT,
  USDC_ADDRESS,
} from '@/lib/consts';
import { MomentType } from '@/types/moment';
import { getOrCreateSmartWallet } from '@/lib/coinbase/getOrCreateSmartWallet';
import { create1155 } from '@/lib/zora/create1155';
import { getFactoryAddress } from '@/lib/protocolSdk/create/factory-addresses';
import { sendUserOperation } from '@/lib/coinbase/sendUserOperation';
import parseMomentsTransaction from './parseMomentsTransaction';
import parseSetupNewTokenEventsOnContract from './parseSetupNewTokenEventsOnContract';
import migrateMuxToArweave from '@/workflows/migrateMuxToArweave';
import indexMoment from './indexMoment';

export interface MomentInput {
  uri: string;
  name: string;
}

const createMoments = async (
  inputs: MomentInput[],
  artistAddress: Address,
  channel?: 'sms' | 'telegram' | 'web' | 'api',
  ctx?: { existingCollectionAddress?: Address }
): Promise<{ contractAddress: Address; tokenId: string }[]> => {
  if (inputs.length === 0) return [];

  const existingCollection = ctx?.existingCollectionAddress;
  const useExisting = !!existingCollection;

  const smartAccount = await getOrCreateSmartWallet({ address: artistAddress });

  const allParameters = await Promise.all(
    inputs.map(({ uri, name }) => {
      const contract = useExisting
        ? { address: existingCollection! }
        : { name, uri };

      return create1155({
        contract,
        token: {
          tokenMetadataURI: uri,
          createReferral: REFERRAL_RECIPIENT as Address,
          salesConfig: {
            type: MomentType.Erc20Mint,
            pricePerToken: parseUnits('1', 6),
            saleStart: BigInt(Math.floor(Date.now() / 1000)),
            saleEnd: maxUint64,
            currency: USDC_ADDRESS[CHAIN_ID],
          },
          mintToCreatorCount: 1,
          payoutRecipient: artistAddress,
        },
        account: artistAddress,
        channel,
      });
    })
  );

  const calls = allParameters.map(({ parameters }) => {
    const isNew =
      getAddress(parameters.address) ===
      getAddress(getFactoryAddress(CHAIN_ID));
    return {
      to: parameters.address,
      data: encodeFunctionData({
        abi: parameters.abi,
        functionName: isNew ? 'createContract' : 'multicall',
        args: parameters.args,
      }),
    };
  });

  const transaction = await sendUserOperation({
    smartAccount,
    network: IS_TESTNET ? 'base-sepolia' : 'base',
    calls,
  });

  const results = useExisting
    ? parseSetupNewTokenEventsOnContract(transaction.logs, existingCollection!)
    : parseMomentsTransaction(transaction.logs);
  const resultByUri = new Map(results.map((r) => [r.uri, r]));

  const matched = inputs.flatMap(({ uri }) => {
    const result = resultByUri.get(uri);
    return result ? [result] : [];
  });

  await Promise.all(
    matched.map(({ contractAddress, tokenId, uri }) => {
      let contractSlice: { address: Address } | { name: string; uri: string };
      if (useExisting) {
        contractSlice = { address: existingCollection! };
      } else {
        const row = inputs.find((i) => i.uri === uri);
        if (!row) {
          throw new Error(
            'createMoments: matched result uri missing from inputs'
          );
        }
        contractSlice = { name: row.name, uri: row.uri };
      }

      return Promise.all([
        migrateMuxToArweave({
          artistAddress,
          moment: {
            collectionAddress: contractAddress,
            tokenId,
            chainId: CHAIN_ID,
          },
          uri,
        }),
        indexMoment({
          contractAddress,
          tokenId,
          artistAddress,
          channel,
          contract: contractSlice,
          token: {
            tokenMetadataURI: uri,
          },
        }),
      ]);
    })
  );

  return matched.map(({ contractAddress, tokenId }) => ({
    contractAddress,
    tokenId,
  }));
};

export default createMoments;
