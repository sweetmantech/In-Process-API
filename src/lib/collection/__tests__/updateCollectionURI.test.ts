import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/coinbase/getOrCreateSmartWallet', () => ({
  getOrCreateSmartWallet: vi.fn(),
}));
vi.mock('@/lib/coinbase/sendUserOperation', () => ({
  sendUserOperation: vi.fn(),
}));
vi.mock('@/lib/viem/getUpdateCollectionURICall', () => ({
  default: vi.fn(),
}));
vi.mock('@/lib/trigger.dev/triggerMuxMigration', () => ({
  default: vi.fn(),
}));

import { getOrCreateSmartWallet } from '@/lib/coinbase/getOrCreateSmartWallet';
import { sendUserOperation } from '@/lib/coinbase/sendUserOperation';
import getUpdateCollectionURICall from '@/lib/viem/getUpdateCollectionURICall';
import triggerMuxMigration from '@/lib/trigger.dev/triggerMuxMigration';
import { updateCollectionURI } from '@/lib/collection/updateCollectionURI';

const ARTIST_ADDRESS =
  '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb01' as `0x${string}`;
const SMART_WALLET_ADDRESS =
  '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1' as `0x${string}`;
const COLLECTION_ADDRESS =
  '0xcccccccccccccccccccccccccccccccccccccc01' as `0x${string}`;
const TX_HASH = '0xdeadbeef';
const NEW_URI = 'ar://some-arweave-hash';
const MOCK_CALL = { to: COLLECTION_ADDRESS, data: '0x1234' };

const baseInput = {
  collection: { address: COLLECTION_ADDRESS, chainId: 8453 },
  newUri: NEW_URI,
  newCollectionName: 'My Collection',
  artistAddress: ARTIST_ADDRESS,
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(getOrCreateSmartWallet).mockResolvedValue({
    address: SMART_WALLET_ADDRESS,
  } as any);
  vi.mocked(sendUserOperation).mockResolvedValue({
    transactionHash: TX_HASH,
  } as any);
  vi.mocked(getUpdateCollectionURICall).mockReturnValue(MOCK_CALL as any);
  vi.mocked(triggerMuxMigration).mockResolvedValue(undefined as any);
});

describe('updateCollectionURI', () => {
  it('returns hash and chainId from request', async () => {
    const result = await updateCollectionURI(baseInput);
    expect(result.hash).toBe(TX_HASH);
    expect(result.chainId).toBe(8453);
  });

  it('creates smart wallet for the artist', async () => {
    await updateCollectionURI(baseInput);
    expect(getOrCreateSmartWallet).toHaveBeenCalledWith({
      address: ARTIST_ADDRESS,
    });
  });

  it('uses base network when chainId is 8453', async () => {
    await updateCollectionURI(baseInput);
    expect(vi.mocked(sendUserOperation).mock.calls[0][0].network).toBe('base');
  });

  it('uses base-sepolia network when chainId is 84532', async () => {
    await updateCollectionURI({
      ...baseInput,
      collection: { address: COLLECTION_ADDRESS, chainId: 84532 },
    });
    expect(vi.mocked(sendUserOperation).mock.calls[0][0].network).toBe(
      'base-sepolia'
    );
  });

  it('passes the call from getUpdateCollectionURICall to sendUserOperation', async () => {
    await updateCollectionURI(baseInput);
    const calls = vi.mocked(sendUserOperation).mock.calls[0][0].calls;
    expect(calls).toEqual([MOCK_CALL]);
  });

  it('triggers mux migration after transaction', async () => {
    await updateCollectionURI(baseInput);
    expect(triggerMuxMigration).toHaveBeenCalledWith({
      uri: NEW_URI,
      collectionAddress: COLLECTION_ADDRESS,
      artistAddress: ARTIST_ADDRESS,
    });
  });

  it('throws when sendUserOperation fails', async () => {
    vi.mocked(sendUserOperation).mockRejectedValue(new Error('tx failed'));
    await expect(updateCollectionURI(baseInput)).rejects.toThrow('tx failed');
  });
});
