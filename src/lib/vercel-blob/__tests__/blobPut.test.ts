import { describe, it, expect, vi, afterEach } from 'vitest';

vi.mock('@/lib/vercel-blob/getBlobReadWriteToken', () => ({
  __esModule: true,
  default: () => 'test-token',
  BLOB_API_URL: 'https://blob.test/api',
  BLOB_API_VERSION: '12',
}));

import blobPut from '@/lib/vercel-blob/blobPut';

describe('blobPut', () => {
  const prevFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = prevFetch;
    vi.restoreAllMocks();
  });

  it('PUTs to blob API with expected headers and returns url', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ url: 'https://store.example/blob' }),
    });
    globalThis.fetch = fetchMock as any;

    const url = await blobPut('my/path', new Uint8Array([1, 2]).buffer);

    expect(url).toBe('https://store.example/blob');
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [calledUrl, init] = fetchMock.mock.calls[0];
    expect(String(calledUrl)).toContain('pathname=my%2Fpath');
    expect(init.method).toBe('PUT');
    expect(init.headers).toMatchObject({
      authorization: 'Bearer test-token',
      'x-api-version': '12',
      'x-vercel-blob-access': 'private',
      'x-add-random-suffix': '0',
      'x-allow-overwrite': '1',
      'x-content-type': 'application/octet-stream',
    });
  });

  it('throws when response is not ok', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 503,
    }) as any;

    await expect(blobPut('p', new ArrayBuffer(0))).rejects.toThrow(/503/);
  });
});
