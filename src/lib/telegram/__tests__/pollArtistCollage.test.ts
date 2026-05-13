import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('@/lib/protocolSdk/retries', () => ({
  retriesGeneric: async <T>({ tryFn }: { tryFn: () => Promise<T> }) => tryFn(),
}));

import pollArtistCollage from '../pollArtistCollage';

describe('pollArtistCollage', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns image bytes when the OG route responds ok', async () => {
    const bytes = new Uint8Array([1, 2, 3]);
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      arrayBuffer: async () => bytes.buffer,
    } as Response);

    const buf = await pollArtistCollage('0xabc');

    expect(buf).toEqual(Buffer.from(bytes));
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/og/artist/collage?')
    );
    expect(vi.mocked(fetch).mock.calls[0][0]).toContain('artistAddress=0xabc');
  });

  it('returns null when the route is not ok', async () => {
    vi.mocked(fetch).mockResolvedValue({ ok: false, status: 503 } as Response);

    await expect(pollArtistCollage('0xabc')).resolves.toBeNull();
  });

  it('returns null when fetch throws', async () => {
    vi.mocked(fetch).mockRejectedValue(new Error('network'));

    await expect(pollArtistCollage('0xabc')).resolves.toBeNull();
  });
});
