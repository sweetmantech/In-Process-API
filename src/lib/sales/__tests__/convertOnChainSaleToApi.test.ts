import { describe, it, expect } from 'vitest';
import { convertOnChainSaleToApi } from '@/lib/sales/convertOnChainSaleToApi';
import { MomentType } from '@/types/moment';

const UINT64_MAX = 18_446_744_073_709_551_615n;
const FUNDS = '0x0000000000000000000000000000000000000001' as const;

describe('convertOnChainSaleToApi', () => {
  it('preserves uint64 max saleEnd without Number precision loss', () => {
    const api = convertOnChainSaleToApi({
      pricePerToken: 1_000_000n,
      saleStart: 1n,
      saleEnd: UINT64_MAX,
      maxTokensPerAddress: 0n,
      fundsRecipient: FUNDS,
      type: MomentType.Erc20Mint,
    });
    expect(api.saleEnd).toBe('18446744073709551615');
    expect(api.saleStart).toBe('1');
  });
});
