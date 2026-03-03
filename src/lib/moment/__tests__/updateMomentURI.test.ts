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

vi.mock('@/lib/trigger.dev/triggerMuxMigration', () => ({
  default: vi.fn(),
}));

import { getOrCreateSmartWallet } from '@/lib/coinbase/getOrCreateSmartWallet';
import { sendUserOperation } from '@/lib/coinbase/sendUserOperation';
import getUpdateTokenURICall from '@/lib/viem/getUpdateTokenURICall';
import triggerMuxMigration from '@/lib/trigger.dev/triggerMuxMigration';
import { updateMomentURI } from '@/lib/moment/updateMomentURI';

const COLLECTION = '0x1111111111111111111111111111111111111111' as const;
const ARTIST = '0x2222222222222222222222222222222222222222' as const;
const TX_HASH =
  '0xaabbccddaabbccddaabbccddaabbccddaabbccddaabbccddaabbccddaabbccdd' as const;

const moment = { collectionAddress: COLLECTION, tokenId: '3', chainId: 8453 };
const baseInput = {
  moment,
  newUri: 'ar://new-metadata-hash',
  artistAddress: ARTIST,
};

describe('updateMomentURI', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(getOrCreateSmartWallet).mockResolvedValue({
      address: ARTIST,
    } as any);
    vi.mocked(getUpdateTokenURICall).mockReturnValue({
      to: COLLECTION,
      data: '0xcalldata',
    } as any);
    vi.mocked(sendUserOperation).mockResolvedValue({
      transactionHash: TX_HASH,
    } as any);
    vi.mocked(triggerMuxMigration).mockResolvedValue(undefined);
  });

  it('returns hash and chainId', async () => {
    const result = await updateMomentURI(baseInput);

    expect(result.hash).toBe(TX_HASH);
    expect(result.chainId).toBe(8453);
  });

  it('calls triggerMuxMigration with correct args', async () => {
    await updateMomentURI(baseInput);

    expect(triggerMuxMigration).toHaveBeenCalledWith({
      uri: 'ar://new-metadata-hash',
      collectionAddress: COLLECTION,
      tokenId: '3',
      artistAddress: ARTIST,
    });
  });

  it('calls sendUserOperation with the encoded call', async () => {
    await updateMomentURI(baseInput);

    expect(sendUserOperation).toHaveBeenCalledWith(
      expect.objectContaining({
        calls: [{ to: COLLECTION, data: '0xcalldata' }],
      })
    );
  });

  it('propagates errors from sendUserOperation', async () => {
    vi.mocked(sendUserOperation).mockRejectedValue(
      new Error('Paymaster failed')
    );

    await expect(updateMomentURI(baseInput)).rejects.toThrow(
      'Paymaster failed'
    );
  });

  it('propagates errors from triggerMuxMigration', async () => {
    vi.mocked(triggerMuxMigration).mockRejectedValue(
      new Error('Trigger.dev unavailable')
    );

    await expect(updateMomentURI(baseInput)).rejects.toThrow(
      'Trigger.dev unavailable'
    );
  });
});
