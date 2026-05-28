import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/smartwallets/getOperationalSmartWallet', () => ({
  getOperationalSmartWallet: vi.fn(),
}));
vi.mock('@/lib/coinbase/sendUserOperation', () => ({
  sendUserOperation: vi.fn(),
}));
vi.mock('@/lib/viem/getUpdateCollectionURICall', () => ({
  default: vi.fn(),
}));

import { getOperationalSmartWallet } from '@/lib/smartwallets/getOperationalSmartWallet';
import { sendUserOperation } from '@/lib/coinbase/sendUserOperation';
import getUpdateCollectionURICall from '@/lib/viem/getUpdateCollectionURICall';
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

const artist = {
  artistId: 'artist-uuid',
  primaryWallet: ARTIST_ADDRESS,
  wallets: [{ address: ARTIST_ADDRESS, type: 'privy' as const }],
};

const baseInput = {
  collection: { address: COLLECTION_ADDRESS, chainId: 8453 },
  newUri: NEW_URI,
  newCollectionName: 'My Collection',
  artist,
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(getOperationalSmartWallet).mockResolvedValue({
    address: SMART_WALLET_ADDRESS,
  } as any);
  vi.mocked(sendUserOperation).mockResolvedValue({
    transactionHash: TX_HASH,
  } as any);
  vi.mocked(getUpdateCollectionURICall).mockReturnValue(MOCK_CALL as any);
});

describe('updateCollectionURI', () => {
  it('returns hash and chainId from request', async () => {
    const result = await updateCollectionURI(baseInput);
    expect(result.hash).toBe(TX_HASH);
    expect(result.chainId).toBe(8453);
  });

  it('resolves the operational smart wallet for the artist', async () => {
    await updateCollectionURI(baseInput);
    expect(getOperationalSmartWallet).toHaveBeenCalledWith({
      artist,
      moment: {
        collectionAddress: COLLECTION_ADDRESS,
        chainId: 8453,
        tokenId: '0',
      },
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

  it('throws when sendUserOperation fails', async () => {
    vi.mocked(sendUserOperation).mockRejectedValue(new Error('tx failed'));
    await expect(updateCollectionURI(baseInput)).rejects.toThrow('tx failed');
  });
});
