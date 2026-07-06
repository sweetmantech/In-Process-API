import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/viem/getInProcessMomentInfo', () => ({
  default: vi.fn(),
}));

import getOnChainUriStep from '../getOnChainUriStep';
import getInProcessMomentInfo from '@/lib/viem/getInProcessMomentInfo';

const mockGetInProcessMomentInfo = vi.mocked(getInProcessMomentInfo);

const moment = {
  collectionAddress: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' as const,
  tokenId: '1',
  chainId: 8453,
};

describe('getOnChainUriStep', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns the on-chain token URI', async () => {
    mockGetInProcessMomentInfo.mockResolvedValue({
      tokenUri: 'https://example.supabase.co/metadata.json',
      saleConfig: {} as never,
      owner: '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
      soldOut: false,
    });

    const result = await getOnChainUriStep(moment);

    expect(result).toBe('https://example.supabase.co/metadata.json');
    expect(mockGetInProcessMomentInfo).toHaveBeenCalledWith(moment);
  });
});
