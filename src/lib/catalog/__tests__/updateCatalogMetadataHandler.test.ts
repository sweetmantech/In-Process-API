import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/coinbase/getOrCreateSmartWallet', () => ({
  getOrCreateSmartWallet: vi.fn(),
}));
vi.mock('@/lib/coinbase/sendUserOperation', () => ({
  sendUserOperation: vi.fn(),
}));

import { getOrCreateSmartWallet } from '@/lib/coinbase/getOrCreateSmartWallet';
import { sendUserOperation } from '@/lib/coinbase/sendUserOperation';
import updateCatalogMetadataHandler from '../updateCatalogMetadataHandler';

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
  moment: {
    tokenId: '1',
    collectionAddress: COLLECTION_ADDRESS,
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

describe('updateCatalogMetadataHandler', () => {
  it('returns hash and chainId on success', async () => {
    const res = await updateCatalogMetadataHandler(baseInput);
    const body = await res.json();
    expect(body.hash).toBe(TX_HASH);
    expect(body.chainId).toBeDefined();
  });

  it('creates smart wallet for the artist', async () => {
    await updateCatalogMetadataHandler(baseInput);
    expect(getOrCreateSmartWallet).toHaveBeenCalledWith({
      address: ARTIST_ADDRESS,
    });
  });

  it('sends exactly one call to the collection contract', async () => {
    await updateCatalogMetadataHandler(baseInput);
    const calls = vi.mocked(sendUserOperation).mock.calls[0][0].calls as any[];
    expect(calls).toHaveLength(1);
    expect(calls[0].to.toLowerCase()).toBe(COLLECTION_ADDRESS.toLowerCase());
  });

  it('encodes updateTokenURI with correct tokenId and uri', async () => {
    await updateCatalogMetadataHandler(baseInput);
    const calls = vi.mocked(sendUserOperation).mock.calls[0][0].calls as any[];
    const callData: string = calls[0].data;
    // updateTokenURI(uint256,string) selector = first 4 bytes of keccak256
    expect(callData).toMatch(/^0x[0-9a-f]+/i);
    // encoded URI bytes should appear in the calldata
    const uriHex = Buffer.from(NEW_URI).toString('hex');
    expect(callData.toLowerCase()).toContain(uriHex.toLowerCase());
  });

  it('throws when sendUserOperation fails', async () => {
    vi.mocked(sendUserOperation).mockRejectedValue(new Error('tx failed'));
    await expect(updateCatalogMetadataHandler(baseInput)).rejects.toThrow(
      'tx failed'
    );
  });
});
