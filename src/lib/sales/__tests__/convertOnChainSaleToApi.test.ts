import { describe, it, expect } from 'vitest';
import { convertOnChainSaleToApi } from '@/lib/sales/convertOnChainSaleToApi';
import { MomentType } from '@/types/moment';

const FUNDS = '0x0000000000000000000000000000000000000001' as const;

describe('convertOnChainSaleToApi', () => {
  it('converts bigint sale fields to number', () => {
    const api = convertOnChainSaleToApi({
      pricePerToken: 1_000_000n,
      saleStart: 1_700_000_000n,
      saleEnd: 1_800_000_000n,
      maxTokensPerAddress: 5n,
      fundsRecipient: FUNDS,
      type: MomentType.Erc20Mint,
    });
    expect(api.saleStart).toBe(1_700_000_000);
    expect(api.saleEnd).toBe(1_800_000_000);
    expect(api.maxTokensPerAddress).toBe(5);
  });
});
