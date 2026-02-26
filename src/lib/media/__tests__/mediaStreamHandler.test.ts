import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextResponse } from 'next/server';
import mediaStreamHandler from '@/lib/media/mediaStreamHandler';

const createMockStream = () => {
  return new ReadableStream({
    start(controller) {
      controller.enqueue(new Uint8Array([1, 2, 3, 4]));
      controller.close();
    },
  });
};

describe('mediaStreamHandler', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('full content response (200)', () => {
    it('should return 200 with full content when no range header', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue({
        ok: true,
        status: 200,
        body: createMockStream(),
      } as Response);

      const result = await mediaStreamHandler({
        uri: 'https://example.com/audio.mp3',
        totalSize: 1000,
        supportsRange: true,
        contentType: 'audio/mpeg',
        rangeHeader: null,
      });

      expect(result.status).toBe(200);
      expect(result.headers.get('Content-Type')).toBe('audio/mpeg');
      expect(result.headers.get('Content-Length')).toBe('1000');
      expect(result.headers.get('Accept-Ranges')).toBe('bytes');
      expect(result.headers.get('Content-Range')).toBeNull();
    });

    it('should return 200 when range requested but origin returns 200', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue({
        ok: true,
        status: 200,
        body: createMockStream(),
      } as Response);

      const result = await mediaStreamHandler({
        uri: 'https://example.com/audio.mp3',
        totalSize: 1000,
        supportsRange: true,
        contentType: 'audio/mpeg',
        rangeHeader: 'bytes=0-499',
      });

      expect(result.status).toBe(200);
      expect(result.headers.get('Content-Length')).toBe('1000');
      expect(result.headers.get('Content-Range')).toBeNull();
    });

    it('should return 200 when origin does not support ranges', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue({
        ok: true,
        status: 200,
        body: createMockStream(),
      } as Response);

      const result = await mediaStreamHandler({
        uri: 'https://example.com/audio.mp3',
        totalSize: 1000,
        supportsRange: false,
        contentType: 'audio/mpeg',
        rangeHeader: 'bytes=0-499',
      });

      expect(result.status).toBe(200);
      expect(result.headers.get('Content-Range')).toBeNull();
      expect(fetch).toHaveBeenCalledWith('https://example.com/audio.mp3', {
        headers: {},
      });
    });
  });

  describe('partial content response (206)', () => {
    it('should return 206 with partial content when range honored', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue({
        ok: true,
        status: 206,
        body: createMockStream(),
      } as Response);

      const result = await mediaStreamHandler({
        uri: 'https://example.com/audio.mp3',
        totalSize: 1000,
        supportsRange: true,
        contentType: 'audio/mpeg',
        rangeHeader: 'bytes=0-499',
      });

      expect(result.status).toBe(206);
      expect(result.headers.get('Content-Length')).toBe('500');
      expect(result.headers.get('Content-Range')).toBe('bytes 0-499/1000');
      expect(fetch).toHaveBeenCalledWith('https://example.com/audio.mp3', {
        headers: { Range: 'bytes=0-499' },
      });
    });

    it('should handle open-ended range', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue({
        ok: true,
        status: 206,
        body: createMockStream(),
      } as Response);

      const result = await mediaStreamHandler({
        uri: 'https://example.com/audio.mp3',
        totalSize: 1000,
        supportsRange: true,
        contentType: 'audio/mpeg',
        rangeHeader: 'bytes=500-',
      });

      expect(result.status).toBe(206);
      expect(result.headers.get('Content-Length')).toBe('500');
      expect(result.headers.get('Content-Range')).toBe('bytes 500-999/1000');
    });

    it('should handle single byte range', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue({
        ok: true,
        status: 206,
        body: createMockStream(),
      } as Response);

      const result = await mediaStreamHandler({
        uri: 'https://example.com/audio.mp3',
        totalSize: 1000,
        supportsRange: true,
        contentType: 'audio/mpeg',
        rangeHeader: 'bytes=0-0',
      });

      expect(result.status).toBe(206);
      expect(result.headers.get('Content-Length')).toBe('1');
      expect(result.headers.get('Content-Range')).toBe('bytes 0-0/1000');
    });
  });

  describe('invalid range headers', () => {
    it('should return 200 for invalid range format', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue({
        ok: true,
        status: 200,
        body: createMockStream(),
      } as Response);

      const result = await mediaStreamHandler({
        uri: 'https://example.com/audio.mp3',
        totalSize: 1000,
        supportsRange: true,
        contentType: 'audio/mpeg',
        rangeHeader: 'invalid',
      });

      expect(result.status).toBe(200);
      expect(result.headers.get('Content-Range')).toBeNull();
    });

    it('should return 200 for multi-range header', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue({
        ok: true,
        status: 200,
        body: createMockStream(),
      } as Response);

      const result = await mediaStreamHandler({
        uri: 'https://example.com/audio.mp3',
        totalSize: 1000,
        supportsRange: true,
        contentType: 'audio/mpeg',
        rangeHeader: 'bytes=0-100,200-300',
      });

      expect(result.status).toBe(200);
    });

    it('should return 200 for out-of-bounds range', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue({
        ok: true,
        status: 200,
        body: createMockStream(),
      } as Response);

      const result = await mediaStreamHandler({
        uri: 'https://example.com/audio.mp3',
        totalSize: 1000,
        supportsRange: true,
        contentType: 'audio/mpeg',
        rangeHeader: 'bytes=1000-',
      });

      expect(result.status).toBe(200);
    });
  });

  describe('error handling', () => {
    it('should return error when fetch fails with 404', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue({
        ok: false,
        status: 404,
        body: null,
      } as Response);

      const result = await mediaStreamHandler({
        uri: 'https://example.com/audio.mp3',
        totalSize: 1000,
        supportsRange: true,
        contentType: 'audio/mpeg',
        rangeHeader: null,
      });

      expect(result).toBeInstanceOf(NextResponse);
      expect(result.status).toBe(404);
    });

    it('should return error when fetch fails with 500', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue({
        ok: false,
        status: 500,
        body: null,
      } as Response);

      const result = await mediaStreamHandler({
        uri: 'https://example.com/audio.mp3',
        totalSize: 1000,
        supportsRange: true,
        contentType: 'audio/mpeg',
        rangeHeader: null,
      });

      expect(result).toBeInstanceOf(NextResponse);
      expect(result.status).toBe(500);
    });

    it('should return 502 when response body is null', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue({
        ok: true,
        status: 200,
        body: null,
      } as Response);

      const result = await mediaStreamHandler({
        uri: 'https://example.com/audio.mp3',
        totalSize: 1000,
        supportsRange: true,
        contentType: 'audio/mpeg',
        rangeHeader: null,
      });

      expect(result).toBeInstanceOf(NextResponse);
      expect(result.status).toBe(502);
    });
  });

  describe('response headers', () => {
    it('should set Cache-Control header', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue({
        ok: true,
        status: 200,
        body: createMockStream(),
      } as Response);

      const result = await mediaStreamHandler({
        uri: 'https://example.com/audio.mp3',
        totalSize: 1000,
        supportsRange: true,
        contentType: 'audio/mpeg',
        rangeHeader: null,
      });

      expect(result.headers.get('Cache-Control')).toBe(
        'public, max-age=31536000, immutable'
      );
    });

    it('should preserve content type from validation', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue({
        ok: true,
        status: 200,
        body: createMockStream(),
      } as Response);

      const result = await mediaStreamHandler({
        uri: 'https://example.com/audio.wav',
        totalSize: 1000,
        supportsRange: true,
        contentType: 'audio/wav',
        rangeHeader: null,
      });

      expect(result.headers.get('Content-Type')).toBe('audio/wav');
    });
  });
});
