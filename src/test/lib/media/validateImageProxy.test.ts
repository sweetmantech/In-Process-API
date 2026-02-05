import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import { validateImageProxy } from '@/lib/media/validateImageProxy';

const createMockRequest = (url: string): NextRequest => {
  return {
    url,
    headers: new Headers(),
    nextUrl: {
      searchParams: new URL(url).searchParams,
    },
  } as unknown as NextRequest;
};

describe('validateImageProxy', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('schema validation', () => {
    it('should return 400 when url is missing', async () => {
      const request = createMockRequest('https://api.example.com/media/image');
      const result = await validateImageProxy(request);

      expect(result).toBeInstanceOf(NextResponse);
      const response = result as NextResponse;
      expect(response.status).toBe(400);
    });

    it('should return 400 when url is empty', async () => {
      const request = createMockRequest(
        'https://api.example.com/media/image?url='
      );
      const result = await validateImageProxy(request);

      expect(result).toBeInstanceOf(NextResponse);
      const response = result as NextResponse;
      expect(response.status).toBe(400);
    });

    it('should return 400 for invalid width', async () => {
      const request = createMockRequest(
        'https://api.example.com/media/image?url=https://example.com/image.jpg&w=5000'
      );
      const result = await validateImageProxy(request);

      expect(result).toBeInstanceOf(NextResponse);
      const response = result as NextResponse;
      expect(response.status).toBe(400);
    });

    it('should return 400 for invalid quality', async () => {
      const request = createMockRequest(
        'https://api.example.com/media/image?url=https://example.com/image.jpg&q=150'
      );
      const result = await validateImageProxy(request);

      expect(result).toBeInstanceOf(NextResponse);
      const response = result as NextResponse;
      expect(response.status).toBe(400);
    });

    it('should return 400 for invalid format', async () => {
      const request = createMockRequest(
        'https://api.example.com/media/image?url=https://example.com/image.jpg&f=gif'
      );
      const result = await validateImageProxy(request);

      expect(result).toBeInstanceOf(NextResponse);
      const response = result as NextResponse;
      expect(response.status).toBe(400);
    });
  });

  describe('URL validation', () => {
    it('should return 400 for invalid URL format', async () => {
      const request = createMockRequest(
        'https://api.example.com/media/image?url=invalid-url'
      );
      const result = await validateImageProxy(request);

      expect(result).toBeInstanceOf(NextResponse);
      const response = result as NextResponse;
      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body.error).toBe('Invalid or unsupported URL format');
    });

    it('should return 400 for http:// URL', async () => {
      const request = createMockRequest(
        'https://api.example.com/media/image?url=http://example.com/image.jpg'
      );
      const result = await validateImageProxy(request);

      expect(result).toBeInstanceOf(NextResponse);
      const response = result as NextResponse;
      expect(response.status).toBe(400);
    });
  });

  describe('successful validation', () => {
    it('should return validated data with defaults', async () => {
      const request = createMockRequest(
        'https://api.example.com/media/image?url=https://example.com/image.jpg'
      );
      const result = await validateImageProxy(request);

      expect(result).not.toBeInstanceOf(NextResponse);
      expect(result).toEqual({
        fetchableUrl: 'https://example.com/image.jpg',
        width: undefined,
        height: undefined,
        quality: 80,
        format: 'webp',
      });
    });

    it('should return validated data with all params', async () => {
      const request = createMockRequest(
        'https://api.example.com/media/image?url=https://example.com/image.jpg&w=800&h=600&q=75&f=avif'
      );
      const result = await validateImageProxy(request);

      expect(result).not.toBeInstanceOf(NextResponse);
      expect(result).toEqual({
        fetchableUrl: 'https://example.com/image.jpg',
        width: 800,
        height: 600,
        quality: 75,
        format: 'avif',
      });
    });

    it('should handle ar:// URLs', async () => {
      const request = createMockRequest(
        'https://api.example.com/media/image?url=ar://abc123&w=400'
      );
      const result = await validateImageProxy(request);

      expect(result).not.toBeInstanceOf(NextResponse);
      expect(result).toEqual({
        fetchableUrl: 'https://arweave.net/abc123',
        width: 400,
        height: undefined,
        quality: 80,
        format: 'webp',
      });
    });

    it('should handle ipfs:// URLs', async () => {
      const request = createMockRequest(
        'https://api.example.com/media/image?url=ipfs://QmTest123&f=jpeg'
      );
      const result = await validateImageProxy(request);

      expect(result).not.toBeInstanceOf(NextResponse);
      expect(result).toMatchObject({
        width: undefined,
        height: undefined,
        quality: 80,
        format: 'jpeg',
      });
    });
  });
});
