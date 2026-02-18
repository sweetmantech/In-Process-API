import { describe, it, expect } from 'vitest';
import { MomentType } from '@/types/moment';
import {
  erc20MinterAddresses,
  zoraCreatorFixedPriceSaleStrategyAddress,
} from '@/lib/protocolSdk/constants';
import getUpdateSaleCall from '@/lib/sales/getUpdateSaleCall';

const COLLECTION = '0x0000000000000000000000000000000000000001' as const;
const CHAIN_ID = 8453;

const moment = {
  collectionAddress: COLLECTION,
  tokenId: '5',
  chainId: CHAIN_ID,
};

const fixedSale = {
  saleStart: BigInt(1000),
  saleEnd: BigInt(9999999),
  maxTokensPerAddress: BigInt(0),
  pricePerToken: BigInt(500),
  fundsRecipient: COLLECTION,
};

const erc20Sale = {
  ...fixedSale,
  currency: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' as const,
};

describe('getUpdateSaleCall', () => {
  it('returns to as the collection address', () => {
    const call = getUpdateSaleCall(
      moment,
      MomentType.FixedPriceMint,
      fixedSale
    );
    expect(call.to).toBe(COLLECTION);
  });

  it('returns encoded data as a hex string', () => {
    const call = getUpdateSaleCall(
      moment,
      MomentType.FixedPriceMint,
      fixedSale
    );
    expect(call.data).toMatch(/^0x/);
  });

  it('encodes callSale with fixed price strategy address for FixedPriceMint', () => {
    const call = getUpdateSaleCall(
      moment,
      MomentType.FixedPriceMint,
      fixedSale
    );
    const expectedStrategy =
      zoraCreatorFixedPriceSaleStrategyAddress[
        CHAIN_ID as keyof typeof zoraCreatorFixedPriceSaleStrategyAddress
      ].toLowerCase();

    expect(call.data.toLowerCase()).toContain(expectedStrategy.slice(2));
  });

  it('encodes callSale with erc20 minter address for Erc20Mint', () => {
    const call = getUpdateSaleCall(moment, MomentType.Erc20Mint, erc20Sale);
    const expectedMinter =
      erc20MinterAddresses[
        CHAIN_ID as keyof typeof erc20MinterAddresses
      ].toLowerCase();

    expect(call.data.toLowerCase()).toContain(expectedMinter.slice(2));
  });

  it('produces different calldata for fixed price vs erc20', () => {
    const fixedCall = getUpdateSaleCall(
      moment,
      MomentType.FixedPriceMint,
      fixedSale
    );
    const erc20Call = getUpdateSaleCall(
      moment,
      MomentType.Erc20Mint,
      erc20Sale
    );

    expect(fixedCall.data).not.toBe(erc20Call.data);
  });
});
