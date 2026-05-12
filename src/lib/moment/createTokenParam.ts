import type { Address } from 'viem';
import type { SalesConfigParamsType } from '@/lib/protocolSdk';
import type { CreateMomentBatchInput } from './createMomentBatch';

const createTokenParam = (
  token: CreateMomentBatchInput['tokens'][number],
  payoutRecipient: Address | undefined
) => ({
  ...token,
  createReferral: token.createReferral as Address,
  mintToCreatorCount:
    token.maxSupply === undefined ? token.mintToCreatorCount : 0,
  payoutRecipient,
  salesConfig: {
    ...token.salesConfig,
    type: token.salesConfig.type as
      | 'erc20Mint'
      | 'fixedPrice'
      | 'timed'
      | 'allowlistMint'
      | undefined,
    currency: token.salesConfig.currency as Address | undefined,
    saleStart: BigInt(token.salesConfig.saleStart),
    saleEnd: BigInt(token.salesConfig.saleEnd),
  } as SalesConfigParamsType,
});

export default createTokenParam;
