import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/viem/getInProcessMomentUri', () => ({
  default: vi.fn(),
}));

import getOnChainUriStep from '../getOnChainUriStep';
import getInProcessMomentUri from '@/lib/viem/getInProcessMomentUri';

const mockGetInProcessMomentUri = vi.mocked(getInProcessMomentUri);

const moment = {
  collectionAddress: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' as const,
  tokenId: '1',
  chainId: 8453,
};

describe('getOnChainUriStep', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns the on-chain token URI', async () => {
    mockGetInProcessMomentUri.mockResolvedValue(
      'https://example.supabase.co/metadata.json'
    );

    const result = await getOnChainUriStep(moment);

    expect(result).toBe('https://example.supabase.co/metadata.json');
    expect(mockGetInProcessMomentUri).toHaveBeenCalledWith(moment);
  });
});
