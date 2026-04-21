import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('@/lib/arweave/fetchUri', () => ({
  default: vi.fn(),
}));

import fetchUri from '@/lib/arweave/fetchUri';
import getMomentMime from '@/lib/moment/getMomentMime';

const mockFetchUri = vi.mocked(fetchUri);

const okResponse = (body: unknown) =>
  ({
    ok: true,
    status: 200,
    text: () => Promise.resolve(JSON.stringify(body)),
  }) as unknown as Response;

const rawOkResponse = (text: string) =>
  ({
    ok: true,
    status: 200,
    text: () => Promise.resolve(text),
  }) as unknown as Response;

const notOkResponse = (status: number) =>
  ({
    ok: false,
    status,
    text: () => Promise.resolve(''),
  }) as unknown as Response;

describe('getMomentMime', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('happy path (no retries)', () => {
    it('returns the mime type from metadata content', async () => {
      mockFetchUri.mockResolvedValue(
        okResponse({ content: { mime: 'video/mp4', uri: 'ar://hash' } })
      );

      expect(await getMomentMime('ar://metadata-hash')).toBe('video/mp4');
      expect(mockFetchUri).toHaveBeenCalledTimes(1);
    });

    it('returns null when content field is absent (no retry)', async () => {
      mockFetchUri.mockResolvedValue(okResponse({ name: 'My Moment' }));

      expect(await getMomentMime('ar://metadata-hash')).toBeNull();
      expect(mockFetchUri).toHaveBeenCalledTimes(1);
    });

    it('returns null when content.mime is absent (no retry)', async () => {
      mockFetchUri.mockResolvedValue(
        okResponse({ content: { uri: 'ar://hash' } })
      );

      expect(await getMomentMime('ar://metadata-hash')).toBeNull();
      expect(mockFetchUri).toHaveBeenCalledTimes(1);
    });

    it('calls fetchUri with the provided URI', async () => {
      mockFetchUri.mockResolvedValue(
        okResponse({ content: { mime: 'image/jpeg' } })
      );

      await getMomentMime('https://example.com/metadata.json');

      expect(mockFetchUri).toHaveBeenCalledWith(
        'https://example.com/metadata.json'
      );
    });
  });

  describe('retry with exponential backoff', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    const flushRetries = async () => {
      // Two retry gaps: 500ms, 1000ms
      await vi.advanceTimersByTimeAsync(500);
      await vi.advanceTimersByTimeAsync(1000);
    };

    it('retries on thrown network error and returns null after max attempts', async () => {
      mockFetchUri.mockRejectedValue(new Error('Network error'));

      const promise = getMomentMime('ar://bad');
      await flushRetries();
      expect(await promise).toBeNull();
      expect(mockFetchUri).toHaveBeenCalledTimes(3);
    });

    it('retries on non-ok response and returns null after max attempts', async () => {
      mockFetchUri.mockResolvedValue(notOkResponse(502));

      const promise = getMomentMime('ar://bad');
      await flushRetries();
      expect(await promise).toBeNull();
      expect(mockFetchUri).toHaveBeenCalledTimes(3);
    });

    it('retries on empty body and returns null after max attempts', async () => {
      mockFetchUri.mockResolvedValue(rawOkResponse(''));

      const promise = getMomentMime('ar://bad');
      await flushRetries();
      expect(await promise).toBeNull();
      expect(mockFetchUri).toHaveBeenCalledTimes(3);
    });

    it('retries on JSON parse error and returns null after max attempts', async () => {
      mockFetchUri.mockResolvedValue(rawOkResponse('<html>not json</html>'));

      const promise = getMomentMime('ar://bad');
      await flushRetries();
      expect(await promise).toBeNull();
      expect(mockFetchUri).toHaveBeenCalledTimes(3);
    });

    it('recovers when a transient failure is followed by success', async () => {
      mockFetchUri
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce(okResponse({ content: { mime: 'video/mp4' } }));

      const promise = getMomentMime('ar://flaky');
      await vi.advanceTimersByTimeAsync(500);
      expect(await promise).toBe('video/mp4');
      expect(mockFetchUri).toHaveBeenCalledTimes(2);
    });
  });
});
