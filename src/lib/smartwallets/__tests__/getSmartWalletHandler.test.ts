import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/coinbase/getArtistSmartAccount', () => ({
  getArtistSmartAccount: vi.fn(),
}));
vi.mock('@/lib/coinbase/getWalletSmartAccount', () => ({
  getWalletSmartAccount: vi.fn(),
}));

import { getArtistSmartAccount } from '@/lib/coinbase/getArtistSmartAccount';
import { getWalletSmartAccount } from '@/lib/coinbase/getWalletSmartAccount';
import getSmartWalletHandler from '@/lib/smartwallets/getSmartWalletHandler';

const ACCOUNT_ID = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';
const WALLET_ADDRESS = '0x1234567890abcdef1234567890abcdef12345678';
const SMART_ADDRESS = '0xabcdef123456789012345678901234567890abcd';

describe('getSmartWalletHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('accountId path', () => {
    it('calls getArtistSmartAccount and returns address', async () => {
      vi.mocked(getArtistSmartAccount).mockResolvedValue({
        address: SMART_ADDRESS,
      } as any);

      const res = await getSmartWalletHandler({ accountId: ACCOUNT_ID });
      const json = await res.json();

      expect(json).toEqual({ address: SMART_ADDRESS });
      expect(getArtistSmartAccount).toHaveBeenCalledWith({
        artistId: ACCOUNT_ID,
      });
      expect(getWalletSmartAccount).not.toHaveBeenCalled();
    });

    it('propagates when getArtistSmartAccount rejects', async () => {
      vi.mocked(getArtistSmartAccount).mockRejectedValue(
        new Error('CDP unavailable')
      );

      await expect(
        getSmartWalletHandler({ accountId: ACCOUNT_ID })
      ).rejects.toThrow('CDP unavailable');
    });
  });

  describe('walletAddress path', () => {
    it('calls getWalletSmartAccount and returns address', async () => {
      vi.mocked(getWalletSmartAccount).mockResolvedValue({
        address: SMART_ADDRESS,
      } as any);

      const res = await getSmartWalletHandler({
        walletAddress: WALLET_ADDRESS,
      });
      const json = await res.json();

      expect(json).toEqual({ address: SMART_ADDRESS });
      expect(getWalletSmartAccount).toHaveBeenCalledWith({
        address: WALLET_ADDRESS,
      });
      expect(getArtistSmartAccount).not.toHaveBeenCalled();
    });

    it('propagates when getWalletSmartAccount rejects', async () => {
      vi.mocked(getWalletSmartAccount).mockRejectedValue(
        new Error('CDP unavailable')
      );

      await expect(
        getSmartWalletHandler({ walletAddress: WALLET_ADDRESS })
      ).rejects.toThrow('CDP unavailable');
    });
  });

  describe('accountId takes precedence when both provided', () => {
    it('calls getArtistSmartAccount when accountId and walletAddress both present', async () => {
      vi.mocked(getArtistSmartAccount).mockResolvedValue({
        address: SMART_ADDRESS,
      } as any);

      const res = await getSmartWalletHandler({
        accountId: ACCOUNT_ID,
        walletAddress: WALLET_ADDRESS,
      });
      const json = await res.json();

      expect(json).toEqual({ address: SMART_ADDRESS });
      expect(getArtistSmartAccount).toHaveBeenCalledWith({
        artistId: ACCOUNT_ID,
      });
      expect(getWalletSmartAccount).not.toHaveBeenCalled();
    });
  });
});
