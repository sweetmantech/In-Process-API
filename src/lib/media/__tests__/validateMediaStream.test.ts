import { describe, it, expect } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
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
      expect(body.errors[0].message).toBe('Invalid or unsupported URL format');
    });

    it('should return 400 for http:// URL', async () => {
      const request = createMockRequest(
        'https://api.example.com/media/stream?url=http://example.com/video.mp4'
      );
      const result = await validateMediaStream(request);

      expect(result).toBeInstanceOf(NextResponse);
      const response = result as NextResponse;
      expect(response.status).toBe(400);
    });

    it('should return 400 for data: URL (video assets use https/ipfs/ar only)', async () => {
      const request = createMockRequest(
        'https://api.example.com/media/stream?url=data:video/mp4;base64,AAAA'
      );
      const result = await validateMediaStream(request);

      expect(result).toBeInstanceOf(NextResponse);
      expect((result as NextResponse).status).toBe(400);
    });
  });

  describe('successful validation', () => {
    it('should return validated data for https URL', async () => {
      const request = createMockRequest(
        'https://api.example.com/media/stream?url=https://example.com/video.mp4'
      );
      const result = await validateMediaStream(request);

      expect(result).not.toBeInstanceOf(NextResponse);
      expect(result).toEqual({
        uri: 'https://example.com/video.mp4',
        rangeHeader: null,
      });
    });

    it('should return validated data for ipfs:// URL', async () => {
      const request = createMockRequest(
        'https://api.example.com/media/stream?url=ipfs://bafyVIDEO'
      );
      const result = await validateMediaStream(request);

      expect(result).not.toBeInstanceOf(NextResponse);
      expect(result).toEqual({
        uri: 'ipfs://bafyVIDEO',
        rangeHeader: null,
      });
    });

    it('should return validated data for ar:// URL', async () => {
      const request = createMockRequest(
        'https://api.example.com/media/stream?url=ar://abc123'
      );
      const result = await validateMediaStream(request);

      expect(result).not.toBeInstanceOf(NextResponse);
      expect(result).toEqual({
        uri: 'ar://abc123',
        rangeHeader: null,
      });
    });

    it('should include range header when provided', async () => {
      const request = createMockRequest(
        'https://api.example.com/media/stream?url=https://example.com/video.mp4',
        'bytes=0-1024'
      );
      const result = await validateMediaStream(request);

      expect(result).not.toBeInstanceOf(NextResponse);
      expect(result).toEqual({
        uri: 'https://example.com/video.mp4',
        rangeHeader: 'bytes=0-1024',
      });
    });
  });
});
