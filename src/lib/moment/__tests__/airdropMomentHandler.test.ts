import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/moment/airdropMoment', () => ({
  airdropMoment: vi.fn(),
}));

import { airdropMoment } from '@/lib/moment/airdropMoment';
import airdropMomentHandler from '@/lib/moment/airdropMomentHandler';

const ARTIST = '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266';
const RECIPIENT = '0x70997970c51812dc3a010c7d01b50e0d17dc79c8';
const COLLECTION = '0x0000000000000000000000000000000000000001';
const TX_HASH =
  '0xtxhash000000000000000000000000000000000000000000000000000000000000';

const params = {
  artistAddress: ARTIST as `0x${string}`,
  recipients: [RECIPIENT as `0x${string}`],
  moment: {
    collectionAddress: COLLECTION as `0x${string}`,
    tokenId: '1',
    chainId: 8453,
  },
};

describe('airdropMomentHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(airdropMoment).mockResolvedValue({
      hash: TX_HASH as `0x${string}`,
      chainId: 8453,
    });
  });

  it('calls airdropMoment with the provided params', async () => {
    await airdropMomentHandler(params);

    expect(airdropMoment).toHaveBeenCalledWith(params);
  });

  it('returns JSON response with hash and chainId', async () => {
    const res = await airdropMomentHandler(params);
    const json = await res.json();

    expect(json.hash).toBe(TX_HASH);
    expect(json.chainId).toBe(8453);
  });

  it('throws when airdropMoment rejects', async () => {
    vi.mocked(airdropMoment).mockRejectedValue(new Error('Smart wallet error'));

    await expect(airdropMomentHandler(params)).rejects.toThrow(
      'Smart wallet error'
    );
  });
});
