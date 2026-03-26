import { describe, it, expect, vi, beforeEach } from 'vitest';
import getCollageImageData from '@/lib/og/getCollageImageData';

vi.mock('@/lib/arweave/fetchUri');
vi.mock('sharp', () => {
  const mockSharp = vi.fn(() => ({
    resize: vi.fn().mockReturnThis(),
    jpeg: vi.fn().mockReturnThis(),
    toBuffer: vi.fn().mockResolvedValue(Buffer.from('jpeg-data')),
  }));
  return { default: mockSharp };
});

import fetchUri from '@/lib/arweave/fetchUri';

beforeEach(() => {
  vi.clearAllMocks();
});

const mockFetchOk = () => {
  vi.mocked(fetchUri).mockResolvedValue({
    ok: true,
    arrayBuffer: () => Promise.resolve(new ArrayBuffer(8)),
  } as unknown as Response);
};

describe('getCollageImageData', () => {
  it('returns null when imageUrl is undefined', async () => {
    const result = await getCollageImageData(undefined);
    expect(result).toBeNull();
    expect(fetchUri).not.toHaveBeenCalled();
  });

  it('returns null when fetch response is not ok', async () => {
    vi.mocked(fetchUri).mockResolvedValue({ ok: false } as Response);

    const result = await getCollageImageData('ar://abc123');
    expect(result).toBeNull();
  });

  it('returns base64 jpeg data URL on success', async () => {
    mockFetchOk();

    const result = await getCollageImageData('ar://abc123');
    expect(result).toMatch(/^data:image\/jpeg;base64,/);
  });

  it('returns null when signal is already aborted', async () => {
    const controller = new AbortController();
    controller.abort();

    vi.mocked(fetchUri).mockResolvedValue({
      ok: true,
      arrayBuffer: () => Promise.resolve(new ArrayBuffer(8)),
    } as unknown as Response);

    const result = await getCollageImageData('ar://abc123', controller.signal);
    expect(result).toBeNull();
  });

  it('returns null when fetch throws AbortError', async () => {
    const abortError = new Error('aborted');
    abortError.name = 'AbortError';
    vi.mocked(fetchUri).mockRejectedValue(abortError);

    const result = await getCollageImageData('ar://abc123');
    expect(result).toBeNull();
  });

  it('returns null when an unexpected error is thrown', async () => {
    vi.mocked(fetchUri).mockRejectedValue(new Error('network error'));

    const result = await getCollageImageData('ar://abc123');
    expect(result).toBeNull();
  });

  it('passes the signal to fetchUri', async () => {
    mockFetchOk();
    const controller = new AbortController();

    await getCollageImageData('ar://abc123', controller.signal);

    expect(fetchUri).toHaveBeenCalledWith('ar://abc123', {
      signal: controller.signal,
    });
  });
});
