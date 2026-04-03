import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/coinbase/getOrCreateSmartWallet', () => ({
  getOrCreateSmartWallet: vi.fn(),
}));
vi.mock('@/lib/coinbase/sendUserOperation', () => ({
  sendUserOperation: vi.fn(),
}));

import { getOrCreateSmartWallet } from '@/lib/coinbase/getOrCreateSmartWallet';
import { sendUserOperation } from '@/lib/coinbase/sendUserOperation';
import updateSoundEditionMetadataHandler from '@/lib/sound/updateSoundEditionMetadataHandler';

const ARTIST_ADDRESS =
  '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb01' as `0x${string}`;
const SMART_WALLET_ADDRESS =
  '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1' as `0x${string}`;
const EDITION_ADDRESS =
  '0xcccccccccccccccccccccccccccccccccccccc01' as `0x${string}`;
const TX_HASH = '0xdeadbeef';
const NEW_URI = 'ar://some-arweave-hash';

const baseInput = {
  artistAddress: ARTIST_ADDRESS,
  collection: { address: EDITION_ADDRESS, chainId: 8453 },
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

describe('updateSoundEditionMetadataHandler', () => {
  it('returns hash and chainId from request on success', async () => {
    const res = await updateSoundEditionMetadataHandler(baseInput);
    const body = await res.json();
    expect(body.hash).toBe(TX_HASH);
    expect(body.chainId).toBe(8453);
  });

  it('creates smart wallet for the artist', async () => {
    await updateSoundEditionMetadataHandler(baseInput);
    expect(getOrCreateSmartWallet).toHaveBeenCalledWith({
      address: ARTIST_ADDRESS,
    });
  });

  it('uses base network when chainId is 8453', async () => {
    await updateSoundEditionMetadataHandler(baseInput);
    expect(vi.mocked(sendUserOperation).mock.calls[0][0].network).toBe('base');
  });

  it('uses base-sepolia network when chainId is 84532', async () => {
    await updateSoundEditionMetadataHandler({
      ...baseInput,
      collection: { address: EDITION_ADDRESS, chainId: 84532 },
    });
    expect(vi.mocked(sendUserOperation).mock.calls[0][0].network).toBe(
      'base-sepolia'
    );
  });

  it('sends exactly one call to the edition contract', async () => {
    await updateSoundEditionMetadataHandler(baseInput);
    const calls = vi.mocked(sendUserOperation).mock.calls[0][0].calls as any[];
    expect(calls).toHaveLength(1);
    expect(calls[0].to.toLowerCase()).toBe(EDITION_ADDRESS.toLowerCase());
  });

  it('encodes setContractURI with correct uri', async () => {
    await updateSoundEditionMetadataHandler(baseInput);
    const calls = vi.mocked(sendUserOperation).mock.calls[0][0].calls as any[];
    const callData: string = calls[0].data;
    expect(callData).toMatch(/^0x[0-9a-f]+/i);
    const uriHex = Buffer.from(NEW_URI).toString('hex');
    expect(callData.toLowerCase()).toContain(uriHex.toLowerCase());
  });

  it('throws when sendUserOperation fails', async () => {
    vi.mocked(sendUserOperation).mockRejectedValue(new Error('tx failed'));
    await expect(updateSoundEditionMetadataHandler(baseInput)).rejects.toThrow(
      'tx failed'
    );
  });
});
