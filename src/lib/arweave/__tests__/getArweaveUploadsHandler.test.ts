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

const mockSuccess = () =>
  vi.mocked(selectArweaveUploads).mockResolvedValue({
    data: [],
    error: null,
  } as any);

describe('getArweaveUploadsHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(FIXED_NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns logs and count on success', async () => {
    vi.mocked(selectArweaveUploads).mockResolvedValue({
      data: [
        {
          id: 1,
          artist_username: 'alice',
          artist_address: '0x1',
          total_count: 2,
          total_usdc_cost: 5.0,
        },
        {
          id: 2,
          artist_username: 'alice',
          artist_address: '0x1',
          total_count: 2,
          total_usdc_cost: 5.0,
        },
      ],
      error: null,
    } as any);

    const res = await getArweaveUploadsHandler({
      limit: 10,
      page: 2,
      sort_by: 'created_at',
      sort_order: 'desc',
    });
    const body = await res.json();

    expect(body).toEqual({
      uploads: [
        { id: 1, artist: { username: 'alice', address: '0x1' } },
        { id: 2, artist: { username: 'alice', address: '0x1' } },
      ],
      count: 2,
      total_usdc_cost: 5,
    });
  });

  it('passes artist to selectArweaveUploads', async () => {
    mockSuccess();

    await getArweaveUploadsHandler({
      artist: '0xaabbcc',
      limit: 20,
      page: 1,
      sort_by: 'created_at',
      sort_order: 'desc',
    });

    expect(selectArweaveUploads).toHaveBeenCalledWith({
      artist: '0xaabbcc',
      from: undefined,
      limit: 20,
      page: 1,
      sortBy: 'created_at',
      sortOrder: 'desc',
    });
  });

  it('passes no artist when not specified', async () => {
    mockSuccess();

    await getArweaveUploadsHandler({
      limit: 20,
      page: 1,
      sort_by: 'created_at',
      sort_order: 'desc',
    });

    expect(selectArweaveUploads).toHaveBeenCalledWith({
      artist: undefined,
      from: undefined,
      limit: 20,
      page: 1,
      sortBy: 'created_at',
      sortOrder: 'desc',
    });
  });

  it('returns 500 when selectArweaveUploads fails', async () => {
    vi.mocked(selectArweaveUploads).mockResolvedValue({
      data: null,
      error: { message: 'db failed' },
    } as any);

    const res = await getArweaveUploadsHandler({
      limit: 20,
      page: 1,
      sort_by: 'created_at',
      sort_order: 'desc',
    });
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body).toEqual({ message: 'Failed to fetch arweave uploads' });
  });

  it('passes from timestamp for period=day', async () => {
    mockSuccess();

    await getArweaveUploadsHandler({
      period: 'day',
      limit: 20,
      page: 1,
      sort_by: 'created_at',
      sort_order: 'desc',
    });

    const expected = new Date(
      FIXED_NOW - 1 * 24 * 60 * 60 * 1000
    ).toISOString();
    expect(selectArweaveUploads).toHaveBeenCalledWith({
      artist: undefined,
      from: expected,
      limit: 20,
      page: 1,
      sortBy: 'created_at',
      sortOrder: 'desc',
    });
  });

  it('passes from timestamp for period=week', async () => {
    mockSuccess();

    await getArweaveUploadsHandler({
      period: 'week',
      limit: 20,
      page: 1,
      sort_by: 'created_at',
      sort_order: 'desc',
    });

    const expected = new Date(
      FIXED_NOW - 7 * 24 * 60 * 60 * 1000
    ).toISOString();
    expect(selectArweaveUploads).toHaveBeenCalledWith({
      artist: undefined,
      from: expected,
      limit: 20,
      page: 1,
      sortBy: 'created_at',
      sortOrder: 'desc',
    });
  });

  it('passes from timestamp for period=month', async () => {
    mockSuccess();

    await getArweaveUploadsHandler({
      period: 'month',
      limit: 20,
      page: 1,
      sort_by: 'created_at',
      sort_order: 'desc',
    });

    const expected = new Date(
      FIXED_NOW - 30 * 24 * 60 * 60 * 1000
    ).toISOString();
    expect(selectArweaveUploads).toHaveBeenCalledWith({
      artist: undefined,
      from: expected,
      limit: 20,
      page: 1,
      sortBy: 'created_at',
      sortOrder: 'desc',
    });
  });

  it('passes from=undefined for period=all', async () => {
    mockSuccess();

    await getArweaveUploadsHandler({
      period: 'all',
      limit: 20,
      page: 1,
      sort_by: 'created_at',
      sort_order: 'desc',
    });

    expect(selectArweaveUploads).toHaveBeenCalledWith({
      artist: undefined,
      from: undefined,
      limit: 20,
      page: 1,
      sortBy: 'created_at',
      sortOrder: 'desc',
    });
  });

  it('passes artist filter through as-is', async () => {
    mockSuccess();

    await getArweaveUploadsHandler({
      artist: 'Alice',
      limit: 20,
      page: 1,
      sort_by: 'created_at',
      sort_order: 'desc',
    });

    expect(selectArweaveUploads).toHaveBeenCalledWith({
      artist: 'Alice',
      from: undefined,
      limit: 20,
      page: 1,
      sortBy: 'created_at',
      sortOrder: 'desc',
    });
  });

  it('passes sort_by and sort_order to selectArweaveUploads', async () => {
    mockSuccess();

    await getArweaveUploadsHandler({
      limit: 20,
      page: 1,
      sort_by: 'size',
      sort_order: 'asc',
    });

    expect(selectArweaveUploads).toHaveBeenCalledWith({
      artist: undefined,
      from: undefined,
      limit: 20,
      page: 1,
      sortBy: 'size',
      sortOrder: 'asc',
    });
  });
});
