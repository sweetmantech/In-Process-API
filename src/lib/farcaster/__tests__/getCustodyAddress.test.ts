import { describe, it, expect, vi, beforeEach } from 'vitest';
import getCustodyAddress from '@/lib/farcaster/getCustodyAddress';

const FID = 12345n;
const custodyAddress = '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266';

describe('getCustodyAddress', () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns lowercased custody address from top-level field', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({ custodyAddress: custodyAddress.toUpperCase() }),
      })
    );

    const result = await getCustodyAddress(FID);
    expect(result).toBe(custodyAddress.toLowerCase());
  });

  it('returns custody address from nested result field', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ result: { custodyAddress } }),
      })
    );

    const result = await getCustodyAddress(FID);
    expect(result).toBe(custodyAddress.toLowerCase());
  });

  it('calls the Hub API with the correct FID', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ custodyAddress }),
    });
    vi.stubGlobal('fetch', fetchMock);

    await getCustodyAddress(FID);
    expect(fetchMock).toHaveBeenCalledWith(
      `https://hub.farcaster.xyz/v1/custodyAddressByFid?fid=${FID}`
    );
  });

  it('throws when the Hub API responds with a non-ok status', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }));

    await expect(getCustodyAddress(FID)).rejects.toThrow(
      'Failed to fetch custody address from Hub'
    );
  });

  it('throws when the response contains no custody address', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({}),
      })
    );

    await expect(getCustodyAddress(FID)).rejects.toThrow(
      'No custody address found for FID'
    );
  });
});
