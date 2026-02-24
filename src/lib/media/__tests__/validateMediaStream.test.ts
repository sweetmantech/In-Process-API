import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';

vi.mock('@/lib/media/getContentInfo', () => ({
  default: vi.fn(),
}));

import getContentInfo from '@/lib/media/getContentInfo';
import { validateMediaStream } from '@/lib/media/validateMediaStream';

const createMockRequest = (url: string, rangeHeader?: string): NextRequest => {
  const headers = new Headers();
  if (rangeHeader) {
    headers.set('range', rangeHeader);
  }
  return {
    url,
    headers,
    nextUrl: {
      searchParams: new URL(url).searchParams,
    },
  } as unknown as NextRequest;
};

describe('validateMediaStream', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('schema validation', () => {
    it('should return 400 when url is missing', async () => {
      const request = createMockRequest('https://api.example.com/media/stream');
      const result = await validateMediaStream(request);

      expect(result).toBeInstanceOf(NextResponse);
      const response = result as NextResponse;
      expect(response.status).toBe(400);
    });

    it('should return 400 when url is empty', async () => {
      const request = createMockRequest(
        'https://api.example.com/media/stream?url='
      );
      const result = await validateMediaStream(request);

      expect(result).toBeInstanceOf(NextResponse);
      const response = result as NextResponse;
      expect(response.status).toBe(400);
    });
  });

  describe('URL validation', () => {
    it('should return 400 for invalid URL format', async () => {
      const request = createMockRequest(
        'https://api.example.com/media/stream?url=invalid-url'
      );
      const result = await validateMediaStream(request);

      expect(result).toBeInstanceOf(NextResponse);
      const response = result as NextResponse;
      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body.error).toBe('Invalid or unsupported URL format');
    });

    it('should return 400 for http:// URL', async () => {
      const request = createMockRequest(
        'https://api.example.com/media/stream?url=http://example.com/audio.mp3'
      );
      const result = await validateMediaStream(request);

      expect(result).toBeInstanceOf(NextResponse);
      const response = result as NextResponse;
      expect(response.status).toBe(400);
    });
  });

  describe('origin error propagation', () => {
    it('should propagate 404 from origin', async () => {
      vi.mocked(getContentInfo).mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });

      const request = createMockRequest(
        'https://api.example.com/media/stream?url=https://example.com/notfound.mp3'
      );
      const result = await validateMediaStream(request);

      expect(result).toBeInstanceOf(NextResponse);
      const response = result as NextResponse;
      expect(response.status).toBe(404);
      const body = await response.json();
      expect(body.error).toBe('Origin returned 404: Not Found');
    });

    it('should propagate 401 from origin', async () => {
      vi.mocked(getContentInfo).mockResolvedValue({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
      });

      const request = createMockRequest(
        'https://api.example.com/media/stream?url=https://example.com/private.mp3'
      );
      const result = await validateMediaStream(request);

      expect(result).toBeInstanceOf(NextResponse);
      const response = result as NextResponse;
      expect(response.status).toBe(401);
    });

    it('should propagate 500 from origin', async () => {
      vi.mocked(getContentInfo).mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      const request = createMockRequest(
        'https://api.example.com/media/stream?url=https://example.com/error.mp3'
      );
      const result = await validateMediaStream(request);

      expect(result).toBeInstanceOf(NextResponse);
      const response = result as NextResponse;
      expect(response.status).toBe(500);
    });
  });

  describe('content length validation', () => {
    it('should return 502 when content length is unknown', async () => {
      vi.mocked(getContentInfo).mockResolvedValue({
        ok: true,
        totalSize: null,
        supportsRange: true,
        contentType: 'audio/mpeg',
      });

      const request = createMockRequest(
        'https://api.example.com/media/stream?url=https://example.com/audio.mp3'
      );
      const result = await validateMediaStream(request);

      expect(result).toBeInstanceOf(NextResponse);
      const response = result as NextResponse;
      expect(response.status).toBe(502);
      const body = await response.json();
      expect(body.error).toBe('Unable to determine content length');
    });
  });

  describe('successful validation', () => {
    it('should return validated data for https URL', async () => {
      vi.mocked(getContentInfo).mockResolvedValue({
        ok: true,
        totalSize: 12345,
        supportsRange: true,
        contentType: 'audio/mpeg',
      });

      const request = createMockRequest(
        'https://api.example.com/media/stream?url=https://example.com/audio.mp3'
      );
      const result = await validateMediaStream(request);

      expect(result).not.toBeInstanceOf(NextResponse);
      expect(result).toEqual({
        fetchableUrl: 'https://example.com/audio.mp3',
        totalSize: 12345,
        supportsRange: true,
        contentType: 'audio/mpeg',
        rangeHeader: null,
      });
    });

    it('should return validated data for ar:// URL', async () => {
      vi.mocked(getContentInfo).mockResolvedValue({
        ok: true,
        totalSize: 54321,
        supportsRange: true,
        contentType: 'audio/wav',
      });

      const request = createMockRequest(
        'https://api.example.com/media/stream?url=ar://abc123'
      );
      const result = await validateMediaStream(request);

      expect(result).not.toBeInstanceOf(NextResponse);
      expect(result).toEqual({
        fetchableUrl: 'https://ar-io.net/abc123',
        totalSize: 54321,
        supportsRange: true,
        contentType: 'audio/wav',
        rangeHeader: null,
      });
    });

    it('should include range header when provided', async () => {
      vi.mocked(getContentInfo).mockResolvedValue({
        ok: true,
        totalSize: 12345,
        supportsRange: true,
        contentType: 'audio/mpeg',
      });

      const request = createMockRequest(
        'https://api.example.com/media/stream?url=https://example.com/audio.mp3',
        'bytes=0-1024'
      );
      const result = await validateMediaStream(request);

      expect(result).not.toBeInstanceOf(NextResponse);
      expect(result).toEqual({
        fetchableUrl: 'https://example.com/audio.mp3',
        totalSize: 12345,
        supportsRange: true,
        contentType: 'audio/mpeg',
        rangeHeader: 'bytes=0-1024',
      });
    });

    it('should return supportsRange false when origin does not support ranges', async () => {
      vi.mocked(getContentInfo).mockResolvedValue({
        ok: true,
        totalSize: 12345,
        supportsRange: false,
        contentType: 'audio/mpeg',
      });

      const request = createMockRequest(
        'https://api.example.com/media/stream?url=https://example.com/audio.mp3'
      );
      const result = await validateMediaStream(request);

      expect(result).not.toBeInstanceOf(NextResponse);
      expect(result).toMatchObject({
        supportsRange: false,
      });
    });
  });
});
