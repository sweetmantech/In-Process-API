import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MomentType } from '@/types/moment';

vi.mock('@/lib/supabase/in_process_sales/selectSale', () => ({
  default: vi.fn(),
}));
vi.mock('@/lib/sales/convertDatabaseSaleToApi', () => ({
  convertDatabaseSaleToApi: vi.fn(),
}));
vi.mock('@/lib/moment/getOnChainSaleConfig', () => ({
  default: vi.fn(),
}));

import selectSale from '@/lib/supabase/in_process_sales/selectSale';
import { convertDatabaseSaleToApi } from '@/lib/sales/convertDatabaseSaleToApi';
import getOnChainSaleConfig from '@/lib/moment/getOnChainSaleConfig';
import resolveMomentFromDb from '@/lib/moment/resolveMomentFromDb';

const COLLECTION = '0x0000000000000000000000000000000000000001' as const;
const CREATOR = '0xcreator000000000000000000000000000000000' as const;

const moment = { collectionAddress: COLLECTION, tokenId: '1', chainId: 8453 };

const makeDbMoment = (protocol: string) => ({
  id: 'moment-uuid',
  uri: 'ar://metadata-hash',
  collection: { creator: CREATOR, protocol },
});

const mockSaleConfig = {
  pricePerToken: '1000',
  saleStart: 0,
  saleEnd: 0,
  maxTokensPerAddress: 0,
  fundsRecipient: COLLECTION,
  type: MomentType.FixedPriceMint,
};

describe('resolveMomentFromDb', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('in_process protocol', () => {
    const dbMoment = makeDbMoment('in_process');

    it('uses DB sale when available', async () => {
      const dbSale = { id: 'sale-1' };
      vi.mocked(selectSale).mockResolvedValue(dbSale as any);
      vi.mocked(convertDatabaseSaleToApi).mockReturnValue(mockSaleConfig as any);

      const result = await resolveMomentFromDb(moment, dbMoment);

      expect(selectSale).toHaveBeenCalledWith('moment-uuid');
      expect(convertDatabaseSaleToApi).toHaveBeenCalledWith(dbSale);
      expect(getOnChainSaleConfig).not.toHaveBeenCalled();
      expect(result.saleConfig).toEqual(mockSaleConfig);
    });

    it('falls back to on-chain when no DB sale', async () => {
      vi.mocked(selectSale).mockResolvedValue(null);
      vi.mocked(getOnChainSaleConfig).mockResolvedValue(mockSaleConfig as any);

      const result = await resolveMomentFromDb(moment, dbMoment);

      expect(getOnChainSaleConfig).toHaveBeenCalledWith(moment);
      expect(convertDatabaseSaleToApi).not.toHaveBeenCalled();
      expect(result.saleConfig).toEqual(mockSaleConfig);
    });

    it('returns id, uri, owner from dbMoment', async () => {
      vi.mocked(selectSale).mockResolvedValue(null);
      vi.mocked(getOnChainSaleConfig).mockResolvedValue(mockSaleConfig as any);

      const result = await resolveMomentFromDb(moment, dbMoment);

      expect(result.id).toBe('moment-uuid');
      expect(result.uri).toBe('ar://metadata-hash');
      expect(result.owner).toBe(CREATOR);
    });
  });

  describe('catalog protocol', () => {
    const dbMoment = makeDbMoment('catalog');

    it('skips sale fetch entirely', async () => {
      const result = await resolveMomentFromDb(moment, dbMoment);

      expect(selectSale).not.toHaveBeenCalled();
      expect(getOnChainSaleConfig).not.toHaveBeenCalled();
      expect(convertDatabaseSaleToApi).not.toHaveBeenCalled();
      expect(result.saleConfig).toBeNull();
    });

    it('returns id, uri, owner from dbMoment', async () => {
      const result = await resolveMomentFromDb(moment, dbMoment);

      expect(result.id).toBe('moment-uuid');
      expect(result.uri).toBe('ar://metadata-hash');
      expect(result.owner).toBe(CREATOR);
    });
  });

  describe('sound.xyz protocol', () => {
    const dbMoment = makeDbMoment('sound.xyz');

    it('skips sale fetch entirely', async () => {
      const result = await resolveMomentFromDb(moment, dbMoment);

      expect(selectSale).not.toHaveBeenCalled();
      expect(getOnChainSaleConfig).not.toHaveBeenCalled();
      expect(convertDatabaseSaleToApi).not.toHaveBeenCalled();
      expect(result.saleConfig).toBeNull();
    });

    it('returns id, uri, owner from dbMoment', async () => {
      const result = await resolveMomentFromDb(moment, dbMoment);

      expect(result.id).toBe('moment-uuid');
      expect(result.uri).toBe('ar://metadata-hash');
      expect(result.owner).toBe(CREATOR);
    });
  });
});
