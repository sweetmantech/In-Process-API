import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock(
  '@/lib/supabase/in_process_arweave_uploads/getCompletedFreeUploads',
  () => ({
    default: vi.fn(),
  })
);

import getCompletedFreeUploads from '@/lib/supabase/in_process_arweave_uploads/getCompletedFreeUploads';
import isMonthlyFreeUploadAvailable from '@/lib/upload/isMonthlyFreeUploadAvailable';

const ARTIST = '0xabc';

describe('isMonthlyFreeUploadAvailable', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns available: true when count is below limit', async () => {
    vi.mocked(getCompletedFreeUploads).mockResolvedValue({
      count: 5,
      error: null,
    } as any);

    expect(await isMonthlyFreeUploadAvailable(ARTIST)).toEqual({
      available: true,
    });
  });

  it('returns available: false when count equals limit', async () => {
    vi.mocked(getCompletedFreeUploads).mockResolvedValue({
      count: 11,
      error: null,
    } as any);

    expect(await isMonthlyFreeUploadAvailable(ARTIST)).toEqual({
      available: false,
    });
  });

  it('returns available: false when count exceeds limit', async () => {
    vi.mocked(getCompletedFreeUploads).mockResolvedValue({
      count: 20,
      error: null,
    } as any);

    expect(await isMonthlyFreeUploadAvailable(ARTIST)).toEqual({
      available: false,
    });
  });

  it('treats null count as 0 and returns available: true', async () => {
    vi.mocked(getCompletedFreeUploads).mockResolvedValue({
      count: null,
      error: null,
    } as any);

    expect(await isMonthlyFreeUploadAvailable(ARTIST)).toEqual({
      available: true,
    });
  });

  it('returns error on DB failure', async () => {
    vi.mocked(getCompletedFreeUploads).mockResolvedValue({
      count: null,
      error: { message: 'db error' },
    } as any);

    expect(await isMonthlyFreeUploadAvailable(ARTIST)).toEqual({
      error: 'Failed to check upload quota',
      status: 500,
    });
  });

  it('passes current month range to getCompletedFreeUploads', async () => {
    vi.mocked(getCompletedFreeUploads).mockResolvedValue({
      count: 0,
      error: null,
    } as any);

    const before = new Date();
    await isMonthlyFreeUploadAvailable(ARTIST);
    const after = new Date();

    const [, monthStart, monthEnd] = vi.mocked(getCompletedFreeUploads).mock
      .calls[0];

    const start = new Date(monthStart);
    const end = new Date(monthEnd);

    expect(start.getUTCDate()).toBe(1);
    expect(start.getUTCHours()).toBe(0);
    expect(end > before).toBe(true);
    expect(end > after).toBe(true);
    expect(end > start).toBe(true);
  });
});
