import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('@/lib/stats/getTimelineStats', () => ({
  default: vi.fn(),
}));

import getTimelineStats from '@/lib/stats/getTimelineStats';
import validateStatsQuery from '@/lib/stats/validateStatsQuery';
import getTimelineStatsHandler from '@/lib/stats/getTimelineStatsHandler';

const ARTIST = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045';

describe('validateStatsQuery', () => {
  it('returns 400 when artist is missing', () => {
    const req = new NextRequest('http://localhost/api/stats/timeline');
    const result = validateStatsQuery(req);
    expect(result).toBeInstanceOf(Response);
  });

  it('returns normalized artist address', () => {
    const req = new NextRequest(
      `http://localhost/api/stats/timeline?artist=${ARTIST}`
    );
    const result = validateStatsQuery(req);
    expect(result).toEqual({ artist: ARTIST.toLowerCase() });
  });
});

describe('getTimelineStatsHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns timeline stats json', async () => {
    vi.mocked(getTimelineStats).mockResolvedValue({
      created_count: 12,
      eth_archived: '0.1',
      usdc_archived: '25',
    });

    const res = await getTimelineStatsHandler({
      artist: ARTIST.toLowerCase() as `0x${string}`,
    });
    const json = await res.json();

    expect(json).toEqual({
      created_count: 12,
      eth_archived: '0.1',
      usdc_archived: '25',
    });
    expect(getTimelineStats).toHaveBeenCalledWith(ARTIST.toLowerCase());
  });
});
