import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextResponse } from 'next/server';
import imageProxyHandler from '@/lib/media/imageProxyHandler';
import { MEDIA_CACHE_TTL_DAYS } from '@/lib/media/mediaCacheConsts';

vi.mock('sharp', () => {
  const mockSharp = vi.fn(() => ({
    autoOrient: vi.fn().mockReturnThis(),
    resize: vi.fn().mockReturnThis(),
    webp: vi.fn().mockReturnThis(),
    avif: vi.fn().mockReturnThis(),
    jpeg: vi.fn().mockReturnThis(),
    png: vi.fn().mockReturnThis(),
    toBuffer: vi.fn().mockResolvedValue(Buffer.from('mock-image-data')),
  }));
  return { default: mockSharp };
});

vi.mock('@/lib/arweave/fetchUri');
vi.mock('@/lib/media/resolveMediaCacheUrl', () => ({
  default: vi.fn().mockResolvedValue(null),
}));
vi.mock('@/lib/media/writeMediaCache', () => ({
  default: vi.fn().mockResolvedValue(undefined),
}));

import fetchUri from '@/lib/arweave/fetchUri';
import resolveMediaCacheUrl from '@/lib/media/resolveMediaCacheUrl';
import writeMediaCache from '@/lib/media/writeMediaCache';

describe('imageProxyHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(resolveMediaCacheUrl).mockResolvedValue(null);
  });

  it('should return processed image with default format (webp)', async () => {
    vi.mocked(fetchUri).mockResolvedValue({
      ok: true,
      arrayBuffer: () => Promise.resolve(new ArrayBuffer(100)),
    } as Response);

    const result = await imageProxyHandler({
      url: 'https://example.com/image.jpg',
      width: 800,
      height: undefined,
      quality: 80,
      format: 'webp',
    });

    expect(result.status).toBe(200);
    expect(result.headers.get('Content-Type')).toBe('image/webp');
    expect(result.headers.get('Cache-Control')).toBe(
      `public, max-age=${MEDIA_CACHE_TTL_DAYS * 24 * 60 * 60}`
    );
    expect(writeMediaCache).toHaveBeenCalled();
    await Promise.resolve();
  });

  it('should redirect when media cache hits', async () => {
    vi.mocked(resolveMediaCacheUrl).mockResolvedValue(
      'https://example.supabase.co/storage/v1/object/public/in_process_files/media-cache/abc.webp'
    );

    const result = await imageProxyHandler({
      url: 'https://example.com/image.jpg',
      width: 420,
      height: undefined,
      quality: 75,
      format: 'webp',
    });

    expect(result.status).toBe(302);
    expect(result.headers.get('Location')).toContain('media-cache/abc.webp');
    expect(fetchUri).not.toHaveBeenCalled();
  });

  it('should return avif format when requested', async () => {
    vi.mocked(fetchUri).mockResolvedValue({
      ok: true,
      arrayBuffer: () => Promise.resolve(new ArrayBuffer(100)),
    } as Response);

    const result = await imageProxyHandler({
      url: 'https://example.com/image.jpg',
      width: undefined,
      height: undefined,
      quality: 75,
      format: 'avif',
    });

    expect(result.status).toBe(200);
    expect(result.headers.get('Content-Type')).toBe('image/avif');
  });

  it('should return jpeg format when requested', async () => {
    vi.mocked(fetchUri).mockResolvedValue({
      ok: true,
      arrayBuffer: () => Promise.resolve(new ArrayBuffer(100)),
    } as Response);

    const result = await imageProxyHandler({
      url: 'https://example.com/image.jpg',
      width: 400,
      height: 300,
      quality: 90,
      format: 'jpeg',
    });

    expect(result.status).toBe(200);
    expect(result.headers.get('Content-Type')).toBe('image/jpeg');
  });

  it('should return png format when requested', async () => {
    vi.mocked(fetchUri).mockResolvedValue({
      ok: true,
      arrayBuffer: () => Promise.resolve(new ArrayBuffer(100)),
    } as Response);

    const result = await imageProxyHandler({
      url: 'https://example.com/image.png',
      width: undefined,
      height: undefined,
      quality: 80,
      format: 'png',
    });

    expect(result.status).toBe(200);
    expect(result.headers.get('Content-Type')).toBe('image/png');
  });

  it('should return error when fetch fails with 404', async () => {
    vi.mocked(fetchUri).mockResolvedValue({
      ok: false,
      status: 404,
    } as Response);

    const result = await imageProxyHandler({
      url: 'https://example.com/notfound.jpg',
      width: undefined,
      height: undefined,
      quality: 80,
      format: 'webp',
    });

    expect(result).toBeInstanceOf(NextResponse);
    expect(result.status).toBe(404);
  });

  it('should return error when fetch fails with 500', async () => {
    vi.mocked(fetchUri).mockResolvedValue({
      ok: false,
      status: 500,
    } as Response);

    const result = await imageProxyHandler({
      url: 'https://example.com/error.jpg',
      width: undefined,
      height: undefined,
      quality: 80,
      format: 'webp',
    });

    expect(result).toBeInstanceOf(NextResponse);
    expect(result.status).toBe(500);
  });
});
