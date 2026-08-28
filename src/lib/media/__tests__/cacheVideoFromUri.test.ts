import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/arweave/fetchUri');
vi.mock('@/lib/media/resolveMediaCacheUrl', () => ({
  default: vi.fn(),
}));
vi.mock('@/lib/media/writeMediaCache', () => ({
  default: vi.fn(),
}));

import fetchUri from '@/lib/arweave/fetchUri';
import resolveMediaCacheUrl from '@/lib/media/resolveMediaCacheUrl';
import writeMediaCache from '@/lib/media/writeMediaCache';
import cacheVideoFromUri from '@/lib/media/cacheVideoFromUri';
import { MAX_VIDEO_CACHE_BYTES } from '@/lib/media/mediaCacheConsts';

describe('cacheVideoFromUri', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(resolveMediaCacheUrl).mockResolvedValue(null);
  });

  it('uploads a full video when size is within the limit', async () => {
    const body = Buffer.from('video-bytes');
    vi.mocked(fetchUri).mockResolvedValue({
      ok: true,
      headers: new Headers({
        'content-type': 'video/mp4',
        'content-length': body.length.toString(),
      }),
      arrayBuffer: () => Promise.resolve(body.buffer.slice(0)),
    } as Response);

    await cacheVideoFromUri({
      uri: 'https://example.com/video.mp4',
      hash: 'abc123',
      path: 'media-cache/abc123.mp4',
    });

    expect(writeMediaCache).toHaveBeenCalledWith({
      hash: 'abc123',
      path: 'media-cache/abc123.mp4',
      kind: 'video',
      buffer: expect.any(Buffer),
      contentType: 'video/mp4',
    });
  });

  it('skips upload when cache already exists', async () => {
    vi.mocked(resolveMediaCacheUrl).mockResolvedValue(
      'https://example.supabase.co/storage/v1/object/public/in_process_files/media-cache/abc123.mp4'
    );

    await cacheVideoFromUri({
      uri: 'https://example.com/video.mp4',
      hash: 'abc123',
      path: 'media-cache/abc123.mp4',
    });

    expect(fetchUri).not.toHaveBeenCalled();
    expect(writeMediaCache).not.toHaveBeenCalled();
  });

  it('skips upload when content-length is missing or too large', async () => {
    vi.mocked(fetchUri).mockResolvedValue({
      ok: true,
      headers: new Headers({ 'content-type': 'video/mp4' }),
      arrayBuffer: () => Promise.resolve(new ArrayBuffer(10)),
    } as Response);

    await cacheVideoFromUri({
      uri: 'https://example.com/video.mp4',
      hash: 'abc123',
      path: 'media-cache/abc123.mp4',
    });
    expect(writeMediaCache).not.toHaveBeenCalled();

    vi.mocked(fetchUri).mockResolvedValue({
      ok: true,
      headers: new Headers({
        'content-type': 'video/mp4',
        'content-length': (MAX_VIDEO_CACHE_BYTES + 1).toString(),
      }),
      arrayBuffer: () => Promise.resolve(new ArrayBuffer(10)),
    } as Response);

    await cacheVideoFromUri({
      uri: 'https://example.com/huge.mp4',
      hash: 'big',
      path: 'media-cache/big.mp4',
    });
    expect(writeMediaCache).not.toHaveBeenCalled();
  });
});
