import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('@/lib/stats/getCollectingStats', () => ({
  default: vi.fn(),
}));

import getCollectingStats from '@/lib/stats/getCollectingStats';
import validateStatsQuery from '@/lib/stats/validateStatsQuery';
import getCollectingStatsHandler from '@/lib/stats/getCollectingStatsHandler';

const ARTIST = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045';

describe('validateStatsQuery', () => {
  it('returns 400 when artist is missing', () => {
    const req = new NextRequest('http://localhost/api/stats/collecting');
    const result = validateStatsQuery(req);
    expect(result).toBeInstanceOf(Response);
  });

  it('returns normalized artist address', () => {
    const req = new NextRequest(
      `http://localhost/api/stats/collecting?artist=${ARTIST}`
    );
    const result = validateStatsQuery(req);
    expect(result).toEqual({ artist: ARTIST.toLowerCase() });
  });
});

describe('getCollectingStatsHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns collecting stats json', async () => {
    vi.mocked(getCollectingStats).mockResolvedValue({
      eth_spent: '0.1',
      usdc_spent: '25',
    });

    const res = await getCollectingStatsHandler({
      artist: ARTIST.toLowerCase() as `0x${string}`,
    });
    const json = await res.json();

    expect(json).toEqual({
      eth_spent: '0.1',
      usdc_spent: '25',
    });
    expect(getCollectingStats).toHaveBeenCalledWith(ARTIST.toLowerCase());
  });
});
