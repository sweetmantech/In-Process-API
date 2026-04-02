import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/coinbase/getOrCreateSmartWallet', () => ({
  getOrCreateSmartWallet: vi.fn(),
}));
vi.mock('@/lib/coinbase/sendUserOperation', () => ({
  sendUserOperation: vi.fn(),
}));

import { getOrCreateSmartWallet } from '@/lib/coinbase/getOrCreateSmartWallet';
import { sendUserOperation } from '@/lib/coinbase/sendUserOperation';
import updateCatalogCollectionMetadataHandler from '../updateCatalogCollectionMetadataHandler';

const ARTIST_ADDRESS =
  '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb01' as `0x${string}`;
const SMART_WALLET_ADDRESS =
  '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1' as `0x${string}`;
const COLLECTION_ADDRESS =
  '0xcccccccccccccccccccccccccccccccccccccc01' as `0x${string}`;
const TX_HASH = '0xdeadbeef';
const NEW_URI = 'ar://some-arweave-hash';

const baseInput = {
  artistAddress: ARTIST_ADDRESS,
  collection: {
    address: COLLECTION_ADDRESS,
    chainId: 8453,
  },
  newUri: NEW_URI,
};

beforeEach(() => {
  vi.clearAllMocks();

  vi.mocked(getOrCreateSmartWallet).mockResolvedValue({
    address: SMART_WALLET_ADDRESS,
  } as any);

  vi.mocked(sendUserOperation).mockResolvedValue({
    transactionHash: TX_HASH,
  } as any);
});

describe('updateCatalogCollectionMetadataHandler', () => {
  it('returns hash and chainId from request on success', async () => {
    const res = await updateCatalogCollectionMetadataHandler(baseInput);
    const body = await res.json();
    expect(body.hash).toBe(TX_HASH);
    expect(body.chainId).toBe(8453);
  });

  it('uses base-sepolia network when chainId is 84532', async () => {
    await updateCatalogCollectionMetadataHandler({
      ...baseInput,
      collection: { address: COLLECTION_ADDRESS, chainId: 84532 },
    });
    expect(vi.mocked(sendUserOperation).mock.calls[0][0].network).toBe(
      'base-sepolia'
    );
  });

  it('uses base network when chainId is 8453', async () => {
    await updateCatalogCollectionMetadataHandler(baseInput);
    expect(vi.mocked(sendUserOperation).mock.calls[0][0].network).toBe('base');
  });

  it('creates smart wallet for the artist', async () => {
    await updateCatalogCollectionMetadataHandler(baseInput);
    expect(getOrCreateSmartWallet).toHaveBeenCalledWith({
      address: ARTIST_ADDRESS,
    });
  });

  it('sends exactly one call to the collection contract', async () => {
    await updateCatalogCollectionMetadataHandler(baseInput);
    const calls = vi.mocked(sendUserOperation).mock.calls[0][0].calls as any[];
    expect(calls).toHaveLength(1);
    expect(calls[0].to.toLowerCase()).toBe(COLLECTION_ADDRESS.toLowerCase());
  });

  it('encodes updateContractURI with correct uri', async () => {
    await updateCatalogCollectionMetadataHandler(baseInput);
    const calls = vi.mocked(sendUserOperation).mock.calls[0][0].calls as any[];
    const callData: string = calls[0].data;
    expect(callData).toMatch(/^0x[0-9a-f]+/i);
    const uriHex = Buffer.from(NEW_URI).toString('hex');
    expect(callData.toLowerCase()).toContain(uriHex.toLowerCase());
  });

  it('throws when sendUserOperation fails', async () => {
    vi.mocked(sendUserOperation).mockRejectedValue(new Error('tx failed'));
    await expect(
      updateCatalogCollectionMetadataHandler(baseInput)
    ).rejects.toThrow('tx failed');
  });
});
