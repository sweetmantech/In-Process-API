import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('@/lib/consts', () => ({ CHAIN_ID: 8453 }));
vi.mock('@/lib/protocolSdk/retries', () => ({
  retriesGeneric: async <T>({ tryFn }: { tryFn: () => Promise<T> }) => tryFn(),
}));

import pollUntilOgReady from '../pollUntilOgReady';

describe('pollUntilOgReady', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('requests the moment OG URL with contract, token, and chain', async () => {
    vi.mocked(fetch).mockResolvedValue({ ok: true } as Response);

    await pollUntilOgReady('0xCollection', '42');

    expect(fetch).toHaveBeenCalledWith(
      'https://in-process-api.vercel.app/api/og/moment?tokenId=42&collectionAddress=0xCollection&chainId=8453'
    );
  });

  it('resolves when the OG route responds ok', async () => {
    vi.mocked(fetch).mockResolvedValue({ ok: true } as Response);

    await expect(
      pollUntilOgReady('0xCollection', '1')
    ).resolves.toBeUndefined();
  });

  it('resolves without throwing when the route is not ok', async () => {
    vi.mocked(fetch).mockResolvedValue({ ok: false, status: 503 } as Response);

    await expect(
      pollUntilOgReady('0xCollection', '1')
    ).resolves.toBeUndefined();
  });

  it('resolves without throwing when fetch rejects', async () => {
    vi.mocked(fetch).mockRejectedValue(new Error('network'));

    await expect(
      pollUntilOgReady('0xCollection', '1')
    ).resolves.toBeUndefined();
  });
});
