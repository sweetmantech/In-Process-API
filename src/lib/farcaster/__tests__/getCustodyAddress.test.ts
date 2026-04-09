import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/farcaster/neynarFetch', () => ({
  default: vi.fn(),
}));

import neynarFetch from '@/lib/farcaster/neynarFetch';
import getCustodyAddress from '@/lib/farcaster/getCustodyAddress';

const FID = 12345n;
const custodyAddress = '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266';

describe('getCustodyAddress', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns lowercased custody address', async () => {
    vi.mocked(neynarFetch).mockResolvedValue({
      users: [{ custody_address: custodyAddress.toUpperCase() }],
    });
    const result = await getCustodyAddress(FID);
    expect(result).toBe(custodyAddress.toLowerCase());
  });

  it('calls Neynar with the correct FID', async () => {
    vi.mocked(neynarFetch).mockResolvedValue({
      users: [{ custody_address: custodyAddress }],
    });
    await getCustodyAddress(FID);
    expect(neynarFetch).toHaveBeenCalledWith(
      `/v2/farcaster/user/bulk?fids=${FID}`
    );
  });

  it('throws when Neynar call fails', async () => {
    vi.mocked(neynarFetch).mockRejectedValue(
      new Error('Neynar API error: 500')
    );
    await expect(getCustodyAddress(FID)).rejects.toThrow('Neynar API error');
  });

  it('throws when the response contains no custody address', async () => {
    vi.mocked(neynarFetch).mockResolvedValue({ users: [] });
    await expect(getCustodyAddress(FID)).rejects.toThrow(
      'No custody address found for FID'
    );
  });
});
