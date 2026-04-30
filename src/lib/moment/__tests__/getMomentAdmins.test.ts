import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/supabase/in_process_admins/selectAdmins', () => ({
  default: vi.fn(),
}));

vi.mock('@/lib/coinbase/getOrCreateSmartWallet', () => ({
  getOrCreateSmartWallet: vi.fn(),
}));

vi.mock('@/lib/zora/getPermission', () => ({
  default: vi.fn(),
}));

import selectAdmins from '@/lib/supabase/in_process_admins/selectAdmins';
import { getOrCreateSmartWallet } from '@/lib/coinbase/getOrCreateSmartWallet';
import getPermission from '@/lib/zora/getPermission';
import getMomentAdmins from '@/lib/moment/getMomentAdmins';

const COLLECTION_ADDRESS =
  '0x1111111111111111111111111111111111111111' as const;
const OWNER = '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
const SMART_ACCOUNT = '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb' as const;

const moment = {
  collectionAddress: COLLECTION_ADDRESS,
  tokenId: '5',
  chainId: 8453,
};

describe('getMomentAdmins', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('with collection (DB path)', () => {
    const collection = { id: 'collection-uuid' };

    it('returns admin addresses from DB', async () => {
      vi.mocked(selectAdmins).mockResolvedValue([
        { artist_address: '0xcccccccccccccccccccccccccccccccccccccccc' },
        { artist_address: '0xdddddddddddddddddddddddddddddddddddddddd' },
      ] as any);

      const result = await getMomentAdmins({
        collection,
        owner: OWNER,
        moment,
        protocol: 'in_process',
      });

      expect(selectAdmins).toHaveBeenCalledWith({
        moments: [{ collectionId: 'collection-uuid', token_id: 5 }],
      });
      expect(getOrCreateSmartWallet).not.toHaveBeenCalled();
      expect(result).toEqual([
        '0xcccccccccccccccccccccccccccccccccccccccc',
        '0xdddddddddddddddddddddddddddddddddddddddd',
      ]);
    });

    it('returns deduplicated and sorted addresses', async () => {
      vi.mocked(selectAdmins).mockResolvedValue([
        { artist_address: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee' },
        { artist_address: '0xcccccccccccccccccccccccccccccccccccccccc' },
        { artist_address: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee' },
      ] as any);

      const result = await getMomentAdmins({
        collection,
        owner: OWNER,
        moment,
        protocol: 'in_process',
      });

      expect(result).toEqual([
        '0xcccccccccccccccccccccccccccccccccccccccc',
        '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
      ]);
    });

    it('returns empty array when no admins found', async () => {
      vi.mocked(selectAdmins).mockResolvedValue([]);

      const result = await getMomentAdmins({
        collection,
        owner: OWNER,
        moment,
        protocol: 'in_process',
      });

      expect(result).toEqual([]);
    });
  });

  describe('without collection, in_process protocol (onchain path)', () => {
    beforeEach(() => {
      vi.mocked(getOrCreateSmartWallet).mockResolvedValue({
        address: SMART_ACCOUNT,
      } as any);
    });

    it('includes smart account and owner when permission is granted', async () => {
      vi.mocked(getPermission).mockResolvedValue(true as any);

      const result = await getMomentAdmins({
        collection: null,
        owner: OWNER,
        moment,
        protocol: 'in_process',
      });

      expect(getOrCreateSmartWallet).toHaveBeenCalledWith({ address: OWNER });
      expect(getPermission).toHaveBeenCalledWith(
        COLLECTION_ADDRESS,
        SMART_ACCOUNT,
        8453
      );
      expect(result).toContain(SMART_ACCOUNT.toLowerCase());
      expect(result).toContain(OWNER.toLowerCase());
    });

    it('includes only owner when permission is not granted', async () => {
      vi.mocked(getPermission).mockResolvedValue(null as any);

      const result = await getMomentAdmins({
        collection: null,
        owner: OWNER,
        moment,
        protocol: 'in_process',
      });

      expect(result).not.toContain(SMART_ACCOUNT.toLowerCase());
      expect(result).toContain(OWNER.toLowerCase());
    });

    it('deduplicates when smart account equals owner', async () => {
      vi.mocked(getOrCreateSmartWallet).mockResolvedValue({
        address: OWNER as any,
      } as any);
      vi.mocked(getPermission).mockResolvedValue(true as any);

      const result = await getMomentAdmins({
        collection: null,
        owner: OWNER,
        moment,
        protocol: 'in_process',
      });

      expect(result).toHaveLength(1);
      expect(result).toContain(OWNER.toLowerCase());
    });

    it('returns empty array when owner is null', async () => {
      const result = await getMomentAdmins({
        collection: null,
        owner: null,
        moment,
        protocol: 'in_process',
      });

      expect(getOrCreateSmartWallet).not.toHaveBeenCalled();
      expect(result).toEqual([]);
    });
  });

  describe('without collection, non-in_process protocol', () => {
    it('returns empty array for catalog protocol', async () => {
      const result = await getMomentAdmins({
        collection: null,
        owner: OWNER,
        moment,
        protocol: 'catalog',
      });

      expect(getOrCreateSmartWallet).not.toHaveBeenCalled();
      expect(result).toEqual([]);
    });

    it('returns empty array for sound protocol', async () => {
      const result = await getMomentAdmins({
        collection: null,
        owner: OWNER,
        moment,
        protocol: 'sound',
      });

      expect(getOrCreateSmartWallet).not.toHaveBeenCalled();
      expect(result).toEqual([]);
    });

    it('returns empty array when protocol is null', async () => {
      const result = await getMomentAdmins({
        collection: null,
        owner: OWNER,
        moment,
        protocol: null,
      });

      expect(getOrCreateSmartWallet).not.toHaveBeenCalled();
      expect(result).toEqual([]);
    });
  });
});
