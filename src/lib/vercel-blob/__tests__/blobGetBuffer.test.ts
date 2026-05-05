import { describe, it, expect, vi, afterEach } from 'vitest';

vi.mock('@/lib/vercel-blob/getBlobReadWriteToken', () => ({
  __esModule: true,
  default: () => 'test-token',
}));

import { Buffer } from 'node:buffer';
import blobGetBuffer from '@/lib/vercel-blob/blobGetBuffer';

describe('blobGetBuffer', () => {
  const prevFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = prevFetch;
    vi.restoreAllMocks();
  });

  it('fetches blob url with bearer and returns buffer', async () => {
    const bytes = new Uint8Array([9, 8, 7]);
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      arrayBuffer: async () => bytes.buffer,
    });
    globalThis.fetch = fetchMock as any;

    const buf = await blobGetBuffer('https://blob.example/x');

    expect(Buffer.from(buf).equals(Buffer.from(bytes))).toBe(true);
    expect(fetchMock).toHaveBeenCalledWith('https://blob.example/x', {
      headers: { authorization: 'Bearer test-token' },
    });
  });

  it('throws when response is not ok', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
    }) as any;

    await expect(blobGetBuffer('https://missing')).rejects.toThrow(/404/);
  });
});
