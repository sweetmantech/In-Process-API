import { describe, it, expect, vi, afterEach } from 'vitest';

vi.mock('@/lib/vercel-blob/getBlobReadWriteToken', () => ({
  __esModule: true,
  default: () => 'test-token',
  BLOB_API_URL: 'https://blob.test/api',
  BLOB_API_VERSION: '12',
}));

import blobDel from '@/lib/vercel-blob/blobDel';

describe('blobDel', () => {
  const prevFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = prevFetch;
    vi.restoreAllMocks();
  });

  it('POSTs delete with a single url wrapped in urls array', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    globalThis.fetch = fetchMock as any;

    await blobDel('https://one');

    expect(fetchMock).toHaveBeenCalledWith(
      'https://blob.test/api/delete',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ urls: ['https://one'] }),
      })
    );
  });

  it('POSTs delete with multiple urls', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    globalThis.fetch = fetchMock as any;

    await blobDel(['https://a', 'https://b']);

    const [, init] = fetchMock.mock.calls[0];
    expect(JSON.parse((init as any).body)).toEqual({
      urls: ['https://a', 'https://b'],
    });
  });

  it('throws when response is not ok', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
    }) as any;

    await expect(blobDel('https://x')).rejects.toThrow(/400/);
  });
});
