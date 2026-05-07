import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock(
  '@/lib/supabase/in_process_arweave_uploads/selectArweaveUploads',
  () => ({
    default: vi.fn(),
  })
);

import selectArweaveUploads from '@/lib/supabase/in_process_arweave_uploads/selectArweaveUploads';
import getArweaveLogsHandler from '@/lib/arweave/getArweaveLogsHandler';

const FIXED_NOW = new Date('2026-05-08T12:00:00.000Z').getTime();

const mockSuccess = () =>
  vi.mocked(selectArweaveUploads).mockResolvedValue({
    data: [],
    count: 0,
    error: null,
  } as any);

describe('getArweaveLogsHandler', () => {
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
      data: [{ id: 1 }, { id: 2 }],
      count: 2,
      error: null,
    } as any);

    const res = await getArweaveLogsHandler({ limit: 10, page: 2 });
    const body = await res.json();

    expect(body).toEqual({ logs: [{ id: 1 }, { id: 2 }], count: 2 });
  });

  it('passes artist to selectArweaveUploads', async () => {
    mockSuccess();

    await getArweaveLogsHandler({ artist: '0xaabbcc', limit: 20, page: 1 });

    expect(selectArweaveUploads).toHaveBeenCalledWith({
      artist: '0xaabbcc',
      from: undefined,
      limit: 20,
      page: 1,
    });
  });

  it('passes no artist when not specified', async () => {
    mockSuccess();

    await getArweaveLogsHandler({ limit: 20, page: 1 });

    expect(selectArweaveUploads).toHaveBeenCalledWith({
      artist: undefined,
      from: undefined,
      limit: 20,
      page: 1,
    });
  });

  it('returns 500 when selectArweaveUploads fails', async () => {
    vi.mocked(selectArweaveUploads).mockResolvedValue({
      data: null,
      count: null,
      error: { message: 'db failed' },
    } as any);

    const res = await getArweaveLogsHandler({ limit: 20, page: 1 });
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body).toEqual({ message: 'Failed to fetch arweave logs' });
  });

  it('passes from timestamp for period=day', async () => {
    mockSuccess();

    await getArweaveLogsHandler({ period: 'day', limit: 20, page: 1 });

    const expected = new Date(FIXED_NOW - 1 * 24 * 60 * 60 * 1000).toISOString();
    expect(selectArweaveUploads).toHaveBeenCalledWith({
      artist: undefined,
      from: expected,
      limit: 20,
      page: 1,
    });
  });

  it('passes from timestamp for period=week', async () => {
    mockSuccess();

    await getArweaveLogsHandler({ period: 'week', limit: 20, page: 1 });

    const expected = new Date(FIXED_NOW - 7 * 24 * 60 * 60 * 1000).toISOString();
    expect(selectArweaveUploads).toHaveBeenCalledWith({
      artist: undefined,
      from: expected,
      limit: 20,
      page: 1,
    });
  });

  it('passes from timestamp for period=month', async () => {
    mockSuccess();

    await getArweaveLogsHandler({ period: 'month', limit: 20, page: 1 });

    const expected = new Date(FIXED_NOW - 30 * 24 * 60 * 60 * 1000).toISOString();
    expect(selectArweaveUploads).toHaveBeenCalledWith({
      artist: undefined,
      from: expected,
      limit: 20,
      page: 1,
    });
  });

  it('passes from=undefined for period=all', async () => {
    mockSuccess();

    await getArweaveLogsHandler({ period: 'all', limit: 20, page: 1 });

    expect(selectArweaveUploads).toHaveBeenCalledWith({
      artist: undefined,
      from: undefined,
      limit: 20,
      page: 1,
    });
  });

  it('passes artist filter through as-is', async () => {
    mockSuccess();

    await getArweaveLogsHandler({ artist: 'Alice', limit: 20, page: 1 });

    expect(selectArweaveUploads).toHaveBeenCalledWith({
      artist: 'Alice',
      from: undefined,
      limit: 20,
      page: 1,
    });
  });
});
