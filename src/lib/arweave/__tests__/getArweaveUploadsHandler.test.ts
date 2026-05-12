import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock(
  '@/lib/supabase/in_process_arweave_uploads/selectArweaveUploads',
  () => ({
    default: vi.fn(),
  })
);

import selectArweaveUploads from '@/lib/supabase/in_process_arweave_uploads/selectArweaveUploads';
import getArweaveUploadsHandler from '@/lib/arweave/getArweaveUploadsHandler';

const FIXED_NOW = new Date('2026-05-08T12:00:00.000Z').getTime();

const mockAggregateSuccess = () =>
  vi.mocked(selectArweaveUploads).mockResolvedValue({
    data: [],
    error: null,
  } as any);

describe('getArweaveUploadsHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(FIXED_NOW);
    mockAggregateSuccess();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns per-artist aggregates and count on success', async () => {
    vi.mocked(selectArweaveUploads).mockResolvedValue({
      data: [
        {
          winc_cost: '100',
          usdc_cost: 1.5,
          file_size_bytes: 1000,
          artist_username: 'alice',
          artist_address: '0x1',
          total_count: 2,
          total_usdc_cost: 4.25,
        },
        {
          winc_cost: '200',
          usdc_cost: 2.75,
          file_size_bytes: 2000,
          artist_username: 'bob',
          artist_address: '0x2',
          total_count: 2,
          total_usdc_cost: 4.25,
        },
      ],
      error: null,
    } as any);

    const res = await getArweaveUploadsHandler({
      listMode: 'aggregate',
      limit: 10,
      page: 2,
      sort_by: 'usdc_cost',
      sort_order: 'desc',
    });
    const body = await res.json();

    expect(body).toEqual({
      uploads: [
        {
          winc_cost: '100',
          usdc_cost: 1.5,
          file_size_bytes: 1000,
          artist_username: 'alice',
          artist_address: '0x1',
        },
        {
          winc_cost: '200',
          usdc_cost: 2.75,
          file_size_bytes: 2000,
          artist_username: 'bob',
          artist_address: '0x2',
        },
      ],
      count: 2,
      total_usdc_cost: 4.25,
    });
    expect(selectArweaveUploads).toHaveBeenCalledWith({
      rpc: 'get_arweave_uploads',
      artist: undefined,
      from: undefined,
      limit: 10,
      page: 2,
      sortBy: 'usdc_cost',
      sortOrder: 'desc',
    });
  });

  it('detail mode returns upload rows without total_usdc_cost', async () => {
    vi.mocked(selectArweaveUploads).mockResolvedValue({
      data: [
        {
          id: 'u1',
          arweave_uri: 'ar://x',
          winc_cost: '1',
          usdc_cost: 0.01,
          file_size_bytes: 100,
          content_type: 'image/png',
          created_at: '2026-01-01T00:00:00Z',
          total_count: 1,
        },
      ],
      error: null,
    } as any);

    const res = await getArweaveUploadsHandler({
      listMode: 'detail',
      artist: '0xabc',
      limit: 20,
      page: 1,
      sort_by: 'size',
      sort_order: 'desc',
    });
    const body = await res.json();

    expect(body).toEqual({
      uploads: [
        {
          id: 'u1',
          arweave_uri: 'ar://x',
          winc_cost: '1',
          usdc_cost: 0.01,
          file_size_bytes: 100,
          content_type: 'image/png',
          created_at: '2026-01-01T00:00:00Z',
        },
      ],
      count: 1,
    });
    expect(selectArweaveUploads).toHaveBeenCalledWith({
      rpc: 'get_artist_arweave_uploads',
      artist: '0xabc',
      from: undefined,
      limit: 20,
      page: 1,
      sortBy: 'size',
      sortOrder: 'desc',
    });
  });

  it('passes artist to get_artist_arweave_uploads in detail mode', async () => {
    mockAggregateSuccess();

    await getArweaveUploadsHandler({
      listMode: 'detail',
      artist: '0xaabbcc',
      limit: 20,
      page: 1,
      sort_by: 'usdc_cost',
      sort_order: 'desc',
    });

    expect(selectArweaveUploads).toHaveBeenCalledWith({
      rpc: 'get_artist_arweave_uploads',
      artist: '0xaabbcc',
      from: undefined,
      limit: 20,
      page: 1,
      sortBy: 'usdc_cost',
      sortOrder: 'desc',
    });
  });

  it('passes no artist when aggregate and not specified', async () => {
    mockAggregateSuccess();

    await getArweaveUploadsHandler({
      listMode: 'aggregate',
      limit: 20,
      page: 1,
      sort_by: 'usdc_cost',
      sort_order: 'desc',
    });

    expect(selectArweaveUploads).toHaveBeenCalledWith({
      rpc: 'get_arweave_uploads',
      artist: undefined,
      from: undefined,
      limit: 20,
      page: 1,
      sortBy: 'usdc_cost',
      sortOrder: 'desc',
    });
  });

  it('returns 500 when aggregate select fails', async () => {
    vi.mocked(selectArweaveUploads).mockResolvedValue({
      data: null,
      error: { message: 'db failed' },
    } as any);

    const res = await getArweaveUploadsHandler({
      listMode: 'aggregate',
      limit: 20,
      page: 1,
      sort_by: 'usdc_cost',
      sort_order: 'desc',
    });
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body).toEqual({ message: 'Failed to fetch arweave uploads' });
  });

  it('returns 500 when detail select fails', async () => {
    vi.mocked(selectArweaveUploads).mockResolvedValue({
      data: null,
      error: { message: 'db failed' },
    } as any);

    const res = await getArweaveUploadsHandler({
      listMode: 'detail',
      artist: '0x1',
      limit: 20,
      page: 1,
      sort_by: 'usdc_cost',
      sort_order: 'desc',
    });
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body).toEqual({ message: 'Failed to fetch arweave uploads' });
  });

  it('passes from timestamp for period=day (aggregate)', async () => {
    mockAggregateSuccess();

    await getArweaveUploadsHandler({
      listMode: 'aggregate',
      period: 'day',
      limit: 20,
      page: 1,
      sort_by: 'usdc_cost',
      sort_order: 'desc',
    });

    const expected = new Date(
      FIXED_NOW - 1 * 24 * 60 * 60 * 1000
    ).toISOString();
    expect(selectArweaveUploads).toHaveBeenCalledWith({
      rpc: 'get_arweave_uploads',
      artist: undefined,
      from: expected,
      limit: 20,
      page: 1,
      sortBy: 'usdc_cost',
      sortOrder: 'desc',
    });
  });

  it('passes from timestamp for period=week (aggregate)', async () => {
    mockAggregateSuccess();

    await getArweaveUploadsHandler({
      listMode: 'aggregate',
      period: 'week',
      limit: 20,
      page: 1,
      sort_by: 'usdc_cost',
      sort_order: 'desc',
    });

    const expected = new Date(
      FIXED_NOW - 7 * 24 * 60 * 60 * 1000
    ).toISOString();
    expect(selectArweaveUploads).toHaveBeenCalledWith({
      rpc: 'get_arweave_uploads',
      artist: undefined,
      from: expected,
      limit: 20,
      page: 1,
      sortBy: 'usdc_cost',
      sortOrder: 'desc',
    });
  });

  it('passes from timestamp for period=month (aggregate)', async () => {
    mockAggregateSuccess();

    await getArweaveUploadsHandler({
      listMode: 'aggregate',
      period: 'month',
      limit: 20,
      page: 1,
      sort_by: 'usdc_cost',
      sort_order: 'desc',
    });

    const expected = new Date(
      FIXED_NOW - 30 * 24 * 60 * 60 * 1000
    ).toISOString();
    expect(selectArweaveUploads).toHaveBeenCalledWith({
      rpc: 'get_arweave_uploads',
      artist: undefined,
      from: expected,
      limit: 20,
      page: 1,
      sortBy: 'usdc_cost',
      sortOrder: 'desc',
    });
  });

  it('passes from=undefined for period=all (aggregate)', async () => {
    mockAggregateSuccess();

    await getArweaveUploadsHandler({
      listMode: 'aggregate',
      period: 'all',
      limit: 20,
      page: 1,
      sort_by: 'usdc_cost',
      sort_order: 'desc',
    });

    expect(selectArweaveUploads).toHaveBeenCalledWith({
      rpc: 'get_arweave_uploads',
      artist: undefined,
      from: undefined,
      limit: 20,
      page: 1,
      sortBy: 'usdc_cost',
      sortOrder: 'desc',
    });
  });

  it('passes sort_by=size to aggregate RPC', async () => {
    mockAggregateSuccess();

    await getArweaveUploadsHandler({
      listMode: 'aggregate',
      limit: 20,
      page: 1,
      sort_by: 'size',
      sort_order: 'asc',
    });

    expect(selectArweaveUploads).toHaveBeenCalledWith({
      rpc: 'get_arweave_uploads',
      artist: undefined,
      from: undefined,
      limit: 20,
      page: 1,
      sortBy: 'size',
      sortOrder: 'asc',
    });
  });

  it('passes sort_by winc_cost to selectArweaveUploads when aggregate', async () => {
    mockAggregateSuccess();

    await getArweaveUploadsHandler({
      listMode: 'aggregate',
      limit: 20,
      page: 1,
      sort_by: 'winc_cost',
      sort_order: 'asc',
    });

    expect(selectArweaveUploads).toHaveBeenCalledWith({
      rpc: 'get_arweave_uploads',
      artist: undefined,
      from: undefined,
      limit: 20,
      page: 1,
      sortBy: 'winc_cost',
      sortOrder: 'asc',
    });
  });
});
