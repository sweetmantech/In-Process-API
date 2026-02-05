import { describe, it, expect, vi, beforeEach } from 'vitest';
import getContentInfo from '@/lib/media/getContentInfo';

describe('getContentInfo', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('should return success with content info on OK response', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      url: 'https://example.com/video.mp4',
      headers: new Headers({
        'content-length': '12345',
        'accept-ranges': 'bytes',
        'content-type': 'video/mp4',
      }),
    } as Response);

    const result = await getContentInfo('https://example.com/video.mp4');

    expect(fetch).toHaveBeenCalledWith('https://example.com/video.mp4', {
      method: 'HEAD',
      redirect: 'follow',
    });
    expect(result).toEqual({
      ok: true,
      totalSize: 12345,
      supportsRange: true,
      contentType: 'video/mp4',
      finalUrl: 'https://example.com/video.mp4',
    });
  });

  it('should return final URL after redirect', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      url: 'https://cdn.example.com/video.mp4',
      headers: new Headers({
        'content-length': '12345',
        'accept-ranges': 'bytes',
        'content-type': 'video/mp4',
      }),
    } as Response);

    const result = await getContentInfo('https://example.com/video.mp4');

    expect(result).toEqual({
      ok: true,
      totalSize: 12345,
      supportsRange: true,
      contentType: 'video/mp4',
      finalUrl: 'https://cdn.example.com/video.mp4',
    });
  });

  it('should return supportsRange false when accept-ranges is not bytes', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      url: 'https://example.com/video.mp4',
      headers: new Headers({
        'content-length': '12345',
        'content-type': 'video/mp4',
      }),
    } as Response);

    const result = await getContentInfo('https://example.com/video.mp4');

    expect(result).toEqual({
      ok: true,
      totalSize: 12345,
      supportsRange: false,
      contentType: 'video/mp4',
      finalUrl: 'https://example.com/video.mp4',
    });
  });

  it('should return null totalSize when content-length is missing', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      url: 'https://example.com/video.mp4',
      headers: new Headers({
        'accept-ranges': 'bytes',
        'content-type': 'video/mp4',
      }),
    } as Response);

    const result = await getContentInfo('https://example.com/video.mp4');

    expect(result).toEqual({
      ok: true,
      totalSize: null,
      supportsRange: true,
      contentType: 'video/mp4',
      finalUrl: 'https://example.com/video.mp4',
    });
  });

  it('should return default content-type when missing', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      url: 'https://example.com/video.mp4',
      headers: new Headers({
        'content-length': '12345',
      }),
    } as Response);

    const result = await getContentInfo('https://example.com/video.mp4');

    expect(result).toEqual({
      ok: true,
      totalSize: 12345,
      supportsRange: false,
      contentType: 'application/octet-stream',
      finalUrl: 'https://example.com/video.mp4',
    });
  });

  it('should return error on 404 response', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: false,
      status: 404,
      statusText: 'Not Found',
      headers: new Headers(),
    } as Response);

    const result = await getContentInfo('https://example.com/notfound.mp4');

    expect(result).toEqual({
      ok: false,
      status: 404,
      statusText: 'Not Found',
    });
  });

  it('should return error on 401 response', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
      headers: new Headers(),
    } as Response);

    const result = await getContentInfo('https://example.com/private.mp4');

    expect(result).toEqual({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
    });
  });

  it('should return error on 500 response', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      headers: new Headers(),
    } as Response);

    const result = await getContentInfo('https://example.com/error.mp4');

    expect(result).toEqual({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    });
  });
});
