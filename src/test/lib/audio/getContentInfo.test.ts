import { describe, it, expect, vi, beforeEach } from 'vitest';
import getContentInfo from '@/lib/audio/getContentInfo';

describe('getContentInfo', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('should return success with content info on OK response', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      headers: new Headers({
        'content-length': '12345',
        'accept-ranges': 'bytes',
        'content-type': 'audio/mpeg',
      }),
    } as Response);

    const result = await getContentInfo('https://example.com/audio.mp3');

    expect(fetch).toHaveBeenCalledWith('https://example.com/audio.mp3', {
      method: 'HEAD',
    });
    expect(result).toEqual({
      ok: true,
      totalSize: 12345,
      supportsRange: true,
      contentType: 'audio/mpeg',
    });
  });

  it('should return supportsRange false when accept-ranges is not bytes', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      headers: new Headers({
        'content-length': '12345',
        'content-type': 'audio/mpeg',
      }),
    } as Response);

    const result = await getContentInfo('https://example.com/audio.mp3');

    expect(result).toEqual({
      ok: true,
      totalSize: 12345,
      supportsRange: false,
      contentType: 'audio/mpeg',
    });
  });

  it('should return null totalSize when content-length is missing', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      headers: new Headers({
        'accept-ranges': 'bytes',
        'content-type': 'audio/mpeg',
      }),
    } as Response);

    const result = await getContentInfo('https://example.com/audio.mp3');

    expect(result).toEqual({
      ok: true,
      totalSize: null,
      supportsRange: true,
      contentType: 'audio/mpeg',
    });
  });

  it('should return default content-type when missing', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      headers: new Headers({
        'content-length': '12345',
      }),
    } as Response);

    const result = await getContentInfo('https://example.com/audio.mp3');

    expect(result).toEqual({
      ok: true,
      totalSize: 12345,
      supportsRange: false,
      contentType: 'application/octet-stream',
    });
  });

  it('should return error on 404 response', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: false,
      status: 404,
      statusText: 'Not Found',
      headers: new Headers(),
    } as Response);

    const result = await getContentInfo('https://example.com/notfound.mp3');

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

    const result = await getContentInfo('https://example.com/private.mp3');

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

    const result = await getContentInfo('https://example.com/error.mp3');

    expect(result).toEqual({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    });
  });
});
