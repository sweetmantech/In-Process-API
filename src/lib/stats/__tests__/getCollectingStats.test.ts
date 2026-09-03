import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/supabase/in_process_transfers/getCollectorsStats', () => ({
  default: vi.fn(),
}));

import getCollectorsStats from '@/lib/supabase/in_process_transfers/getCollectorsStats';
import getCollectingStats, {
  emptyCollectingStats,
} from '../getCollectingStats';

describe('getCollectingStats', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns collectors spend stats for the artist', async () => {
    vi.mocked(getCollectorsStats).mockResolvedValue({
      data: [
        {
          artist_id: 'artist-1',
          username: 'ziad',
          wallets: [{ address: '0xabc', type: 'eoa' }],
          collected_count: 12,
          eth_spent: '1.5',
          usdc_spent: '320.25',
        },
      ],
    });

    await expect(
      getCollectingStats('0xAbC0000000000000000000000000000000000001')
    ).resolves.toEqual({
      eth_spent: '1.5',
      usdc_spent: '320.25',
    });

    expect(getCollectorsStats).toHaveBeenCalledWith({
      artist: '0xabc0000000000000000000000000000000000001',
      period: 'all',
      limit: 1,
      page: 1,
    });
  });

  it('returns empty stats when no collector row exists', async () => {
    vi.mocked(getCollectorsStats).mockResolvedValue({
      data: [],
    });

    await expect(getCollectingStats('0xabc')).resolves.toEqual(
      emptyCollectingStats
    );
  });

  it('returns empty stats when the RPC fails', async () => {
    vi.mocked(getCollectorsStats).mockRejectedValue(new Error('rpc failed'));

    await expect(getCollectingStats('0xabc')).resolves.toEqual(
      emptyCollectingStats
    );
  });
});
