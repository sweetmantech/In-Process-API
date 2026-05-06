import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock(
  '@/lib/supabase/in_process_arweave_uploads/selectArweaveUploads',
  () => ({
    default: vi.fn(),
  })
);

import selectArweaveUploads from '@/lib/supabase/in_process_arweave_uploads/selectArweaveUploads';
import getArweaveLogsHandler from '@/lib/arweave/getArweaveLogsHandler';

describe('getArweaveLogsHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns logs and count on success', async () => {
    vi.mocked(selectArweaveUploads).mockResolvedValue({
      data: [{ id: 1 }, { id: 2 }],
      count: 2,
      error: null,
    } as any);

    const res = await getArweaveLogsHandler({
      artistAddress: '0xabc',
      limit: 10,
      page: 2,
    });
    const body = await res.json();

    expect(body).toEqual({ logs: [{ id: 1 }, { id: 2 }], count: 2 });
  });

  it('passes lowercased artistAddress for non-admin callers', async () => {
    vi.mocked(selectArweaveUploads).mockResolvedValue({
      data: [],
      count: 0,
      error: null,
    } as any);

    await getArweaveLogsHandler({
      artistAddress: '0xAABBcc',
      limit: 20,
      page: 1,
    });

    expect(selectArweaveUploads).toHaveBeenCalledWith({
      artistAddress: '0xaabbcc',
      limit: 20,
      page: 1,
    });
  });

  it('omits artistAddress filter for admin callers', async () => {
    vi.mocked(selectArweaveUploads).mockResolvedValue({
      data: [],
      count: 0,
      error: null,
    } as any);

    await getArweaveLogsHandler({
      artistAddress: '0xAf1452d289E22Fbd0DeA9D5097353C72A90faC33',
      limit: 20,
      page: 1,
    });

    expect(selectArweaveUploads).toHaveBeenCalledWith({
      artistAddress: undefined,
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

    const res = await getArweaveLogsHandler({
      artistAddress: '0xabc',
      limit: 20,
      page: 1,
    });
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body).toEqual({ message: 'Failed to fetch arweave logs' });
  });
});
