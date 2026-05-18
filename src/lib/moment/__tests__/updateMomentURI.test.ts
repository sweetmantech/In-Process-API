import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/coinbase/getOrCreateSmartWallet', () => ({
  getOrCreateSmartWallet: vi.fn(),
}));

vi.mock('@/lib/coinbase/sendUserOperation', () => ({
  sendUserOperation: vi.fn(),
}));

vi.mock('@/lib/viem/getUpdateTokenURICall', () => ({
  default: vi.fn(),
}));

vi.mock('@/lib/moment/getUpdateCollectionCall', () => ({
  default: vi.fn(),
}));

import { getOrCreateSmartWallet } from '@/lib/coinbase/getOrCreateSmartWallet';
import { sendUserOperation } from '@/lib/coinbase/sendUserOperation';
import getUpdateTokenURICall from '@/lib/viem/getUpdateTokenURICall';
import getUpdateCollectionCall from '@/lib/moment/getUpdateCollectionCall';
import { updateMomentURI } from '@/lib/moment/updateMomentURI';

const COLLECTION = '0x1111111111111111111111111111111111111111' as const;
const ARTIST = '0x2222222222222222222222222222222222222222' as const;
const TX_HASH =
  '0xaabbccddaabbccddaabbccddaabbccddaabbccddaabbccddaabbccddaabbccdd' as const;

const NEW_COLLECTION = '0x3333333333333333333333333333333333333333' as const;
const moment = { collectionAddress: COLLECTION, tokenId: '3', chainId: 8453 };
const baseInput = { moment, newUri: 'ar://new-metadata-hash', artistAddress: ARTIST };

describe('updateMomentURI', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(getOrCreateSmartWallet).mockResolvedValue({ address: ARTIST } as any);
    vi.mocked(getUpdateTokenURICall).mockReturnValue({ to: COLLECTION, data: '0xcalldata' } as any);
    vi.mocked(sendUserOperation).mockResolvedValue({ transactionHash: TX_HASH } as any);
  });

  it('returns hash, chainId, contractAddress, tokenId', async () => {
    const result = await updateMomentURI(baseInput);

    expect(result.hash).toBe(TX_HASH);
    expect(result.chainId).toBe(8453);
    expect(result.contractAddress).toBe(COLLECTION);
    expect(result.tokenId).toBe('3');
  });

  it('calls sendUserOperation with the encoded update call', async () => {
    await updateMomentURI(baseInput);

    expect(sendUserOperation).toHaveBeenCalledWith(
      expect.objectContaining({
        calls: [{ to: COLLECTION, data: '0xcalldata' }],
      })
    );
  });

  it('propagates errors from sendUserOperation', async () => {
    vi.mocked(sendUserOperation).mockRejectedValue(new Error('Paymaster failed'));

    await expect(updateMomentURI(baseInput)).rejects.toThrow('Paymaster failed');
  });

  describe('when newCollectionAddress is provided', () => {
    beforeEach(() => {
      vi.mocked(getUpdateCollectionCall).mockResolvedValue({
        call: { to: NEW_COLLECTION, data: '0xcreatedata' },
        redirectUri: 'ar://redirect-hash',
        contractAddress: NEW_COLLECTION,
        tokenId: '1',
      } as any);
      vi.mocked(getUpdateTokenURICall).mockReturnValue({ to: COLLECTION, data: '0xredirectcalldata' } as any);
    });

    it('returns new contractAddress and tokenId', async () => {
      const result = await updateMomentURI({ ...baseInput, newCollectionAddress: NEW_COLLECTION });

      expect(result.contractAddress).toBe(NEW_COLLECTION);
      expect(result.tokenId).toBe('1');
    });

    it('sends create call followed by update call', async () => {
      await updateMomentURI({ ...baseInput, newCollectionAddress: NEW_COLLECTION });

      expect(sendUserOperation).toHaveBeenCalledWith(
        expect.objectContaining({
          calls: [
            { to: NEW_COLLECTION, data: '0xcreatedata' },
            { to: COLLECTION, data: '0xredirectcalldata' },
          ],
        })
      );
    });
  });
});
