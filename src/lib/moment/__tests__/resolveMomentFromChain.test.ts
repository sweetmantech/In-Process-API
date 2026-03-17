import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MomentType } from '@/types/moment';

vi.mock('@/lib/viem/isCatalogContract', () => ({
  default: vi.fn(),
}));
vi.mock('@/lib/viem/getCatalogInfo', () => ({
  default: vi.fn(),
}));
vi.mock('@/lib/viem/getInProcessMomentInfo', () => ({
  default: vi.fn(),
}));
vi.mock('@/lib/sales/convertOnChainSaleToApi', () => ({
  convertOnChainSaleToApi: vi.fn(),
}));

import isCatalogContract from '@/lib/viem/isCatalogContract';
import getCatalogInfo from '@/lib/viem/getCatalogInfo';
import getInProcessMomentInfo from '@/lib/viem/getInProcessMomentInfo';
import { convertOnChainSaleToApi } from '@/lib/sales/convertOnChainSaleToApi';
import resolveMomentFromChain from '@/lib/moment/resolveMomentFromChain';

const COLLECTION = '0x0000000000000000000000000000000000000001' as const;
const OWNER = '0xowner00000000000000000000000000000000000' as const;

const moment = { collectionAddress: COLLECTION, tokenId: '1', chainId: 8453 };

const mockSaleConfig = {
  pricePerToken: '1000',
  saleStart: 0,
  saleEnd: 0,
  maxTokensPerAddress: 0,
  fundsRecipient: COLLECTION,
  type: MomentType.FixedPriceMint,
};

describe('resolveMomentFromChain', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('catalog contract', () => {
    beforeEach(() => {
      vi.mocked(isCatalogContract).mockResolvedValue(true);
      vi.mocked(getCatalogInfo).mockResolvedValue({
        saleConfig: mockSaleConfig,
        tokenUri: 'ar://catalog-uri',
      } as any);
    });

    it('calls getCatalogInfo', async () => {
      await resolveMomentFromChain(moment);
      expect(getCatalogInfo).toHaveBeenCalledWith(moment);
      expect(getInProcessMomentInfo).not.toHaveBeenCalled();
    });

    it('returns collectionAddress as owner', async () => {
      const result = await resolveMomentFromChain(moment);
      expect(result.owner).toBe(COLLECTION);
    });

    it('returns tokenUri from getCatalogInfo', async () => {
      const result = await resolveMomentFromChain(moment);
      expect(result.uri).toBe('ar://catalog-uri');
    });

    it('returns id as null', async () => {
      const result = await resolveMomentFromChain(moment);
      expect(result.id).toBeNull();
    });
  });

  describe('in_process contract', () => {
    beforeEach(() => {
      vi.mocked(isCatalogContract).mockResolvedValue(false);
      vi.mocked(getInProcessMomentInfo).mockResolvedValue({
        saleConfig: {
          pricePerToken: BigInt(500),
          type: MomentType.FixedPriceMint,
        },
        owner: OWNER,
        tokenUri: 'ar://inprocess-uri',
      } as any);
      vi.mocked(convertOnChainSaleToApi).mockReturnValue(mockSaleConfig as any);
    });

    it('calls getInProcessMomentInfo', async () => {
      await resolveMomentFromChain(moment);
      expect(getInProcessMomentInfo).toHaveBeenCalledWith(moment);
      expect(getCatalogInfo).not.toHaveBeenCalled();
    });

    it('returns owner from getInProcessMomentInfo', async () => {
      const result = await resolveMomentFromChain(moment);
      expect(result.owner).toBe(OWNER);
    });

    it('returns tokenUri from getInProcessMomentInfo', async () => {
      const result = await resolveMomentFromChain(moment);
      expect(result.uri).toBe('ar://inprocess-uri');
    });

    it('converts saleConfig via convertOnChainSaleToApi', async () => {
      await resolveMomentFromChain(moment);
      expect(convertOnChainSaleToApi).toHaveBeenCalled();
    });

    it('returns id as null', async () => {
      const result = await resolveMomentFromChain(moment);
      expect(result.id).toBeNull();
    });
  });
});
