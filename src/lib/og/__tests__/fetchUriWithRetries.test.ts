import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('@/lib/arweave/fetchUri', () => ({
  default: vi.fn(),
}));

import fetchUri from '@/lib/arweave/fetchUri';
import fetchUriWithRetries from '@/lib/og/fetchUriWithRetries';

const mockFetchUri = vi.mocked(fetchUri);

const okResponse = () =>
  ({
    ok: true,
    status: 200,
  }) as Response;

const notOkResponse = (status: number) =>
  ({
    ok: false,
    status,
  }) as Response;

beforeEach(() => {
  vi.clearAllMocks();
});

describe('fetchUriWithRetries', () => {
  it('returns response on first successful fetch', async () => {
    const res = okResponse();
    mockFetchUri.mockResolvedValue(res);

    await expect(
      fetchUriWithRetries('https://example.com/a.jpg')
    ).resolves.toBe(res);
    expect(mockFetchUri).toHaveBeenCalledTimes(1);
    expect(mockFetchUri).toHaveBeenCalledWith('https://example.com/a.jpg');
  });

  describe('retry with backoff', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    const flushRetries = async () => {
      await vi.advanceTimersByTimeAsync(500);
      await vi.advanceTimersByTimeAsync(1000);
    };

    it('retries on non-ok response then succeeds', async () => {
      const ok = okResponse();
      mockFetchUri
        .mockResolvedValueOnce(notOkResponse(503))
        .mockResolvedValueOnce(ok);

      const promise = fetchUriWithRetries('https://example.com/x');
      await vi.advanceTimersByTimeAsync(500);
      await expect(promise).resolves.toBe(ok);
      expect(mockFetchUri).toHaveBeenCalledTimes(2);
    });

    it('retries on thrown error then succeeds', async () => {
      const ok = okResponse();
      mockFetchUri
        .mockRejectedValueOnce(new Error('network'))
        .mockResolvedValueOnce(ok);

      const promise = fetchUriWithRetries('https://example.com/x');
      await vi.advanceTimersByTimeAsync(500);
      await expect(promise).resolves.toBe(ok);
      expect(mockFetchUri).toHaveBeenCalledTimes(2);
    });

    it('throws after max attempts on persistent non-ok response', async () => {
      mockFetchUri.mockResolvedValue(notOkResponse(502));

      const promise = fetchUriWithRetries('https://example.com/x');
      const assertion = expect(promise).rejects.toThrow(
        'failed to get image metadata'
      );
      await flushRetries();
      await assertion;
      expect(mockFetchUri).toHaveBeenCalledTimes(3);
    });
  });
});
