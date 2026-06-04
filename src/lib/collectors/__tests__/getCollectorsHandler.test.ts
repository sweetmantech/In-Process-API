import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/supabase/in_process_transfers/getCollectorsStats', () => ({
  default: vi.fn(),
}));

import getCollectorsStats from '@/lib/supabase/in_process_transfers/getCollectorsStats';
import getCollectorsHandler from '@/lib/collectors/getCollectorsHandler';

const BASE_PARAMS = {
  period: 'all' as const,
  limit: 20,
  page: 1,
  artist: undefined as string | undefined,
  sort_by: 'collected_count' as const,
  sort_order: 'desc' as const,
};

const makeRow = (overrides = {}) => ({
  collector: '0xcollector',
  username: 'alice',
  collected_count: 5,
  eth_spent: '0.01',
  usdc_spent: '10',
  ...overrides,
});

describe('getCollectorsHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns data with pagination on success', async () => {
    vi.mocked(getCollectorsStats).mockResolvedValue({
      data: [makeRow()],
      totalCount: 50,
    });

    const res = await getCollectorsHandler(BASE_PARAMS);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.data).toHaveLength(1);
    expect(json.total_count).toBe(50);
    expect(json.page).toBe(1);
    expect(json.total_pages).toBe(3);
  });

  it('passes all params to getCollectorsStats', async () => {
    vi.mocked(getCollectorsStats).mockResolvedValue({
      data: [],
      totalCount: 0,
    });

    await getCollectorsHandler({
      period: 'week',
      limit: 10,
      page: 2,
      artist: 'bob',
      sort_by: 'eth_spent',
      sort_order: 'asc',
    });

    expect(getCollectorsStats).toHaveBeenCalledWith({
      period: 'week',
      limit: 10,
      page: 2,
      artist: 'bob',
      sort_by: 'eth_spent',
      sort_order: 'asc',
    });
  });

  it('returns total_pages 0 when totalCount is 0', async () => {
    vi.mocked(getCollectorsStats).mockResolvedValue({
      data: [],
      totalCount: 0,
    });

    const res = await getCollectorsHandler(BASE_PARAMS);
    const json = await res.json();

    expect(json.total_count).toBe(0);
    expect(json.total_pages).toBe(0);
  });

  it('includes collector address and username in response', async () => {
    vi.mocked(getCollectorsStats).mockResolvedValue({
      data: [makeRow({ collector: '0xabc', username: 'charlie' })],
      totalCount: 1,
    });

    const res = await getCollectorsHandler(BASE_PARAMS);
    const json = await res.json();

    expect(json.data[0].collector).toBe('0xabc');
    expect(json.data[0].username).toBe('charlie');
  });

  it('includes eth_spent and usdc_spent in response', async () => {
    vi.mocked(getCollectorsStats).mockResolvedValue({
      data: [makeRow({ eth_spent: '0.5', usdc_spent: '25.0' })],
      totalCount: 1,
    });

    const res = await getCollectorsHandler(BASE_PARAMS);
    const json = await res.json();

    expect(json.data[0].eth_spent).toBe('0.5');
    expect(json.data[0].usdc_spent).toBe('25.0');
  });

  it('propagates error when getCollectorsStats throws', async () => {
    vi.mocked(getCollectorsStats).mockRejectedValue(new Error('DB failed'));

    await expect(getCollectorsHandler(BASE_PARAMS)).rejects.toThrow(
      'DB failed'
    );
  });
});
