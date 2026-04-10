import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/farcaster/neynarFetch', () => ({
  default: vi.fn(),
}));

import neynarFetch from '@/lib/farcaster/neynarFetch';
import getFarcasterAddresses from '@/lib/farcaster/getFarcasterAddresses';

const FID = 12345n;
const custodyAddress = '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266';

describe('getFarcasterAddresses', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns lowercased custodyAddress and verifiedAddress from verified_addresses.primary.eth_address', async () => {
    const primaryEthAddress = '0x70997970c51812dc3a010c7d01b50e0d17dc79c8';
    vi.mocked(neynarFetch).mockResolvedValue({
      users: [
        {
          custody_address: custodyAddress.toUpperCase(),
          display_name: 'ziad',
          verified_addresses: {
            primary: { eth_address: primaryEthAddress.toUpperCase() },
          },
        },
      ],
    });
    const result = await getFarcasterAddresses(FID);
    expect(result).toEqual({
      custodyAddress: custodyAddress.toLowerCase(),
      verifiedAddress: primaryEthAddress.toLowerCase(),
      artistName: 'ziad',
    });
  });

  it('falls back to custodyAddress as verifiedAddress when primary eth_address is absent', async () => {
    vi.mocked(neynarFetch).mockResolvedValue({
      users: [{ custody_address: custodyAddress, verified_addresses: {} }],
    });
    const result = await getFarcasterAddresses(FID);
    expect(result).toEqual({
      custodyAddress: custodyAddress.toLowerCase(),
      verifiedAddress: custodyAddress.toLowerCase(),
      artistName: undefined,
    });
  });

  it('returns artistName as undefined when display_name is absent', async () => {
    vi.mocked(neynarFetch).mockResolvedValue({
      users: [{ custody_address: custodyAddress, verified_addresses: {} }],
    });
    const { artistName } = await getFarcasterAddresses(FID);
    expect(artistName).toBeUndefined();
  });

  it('calls Neynar with the correct FID', async () => {
    vi.mocked(neynarFetch).mockResolvedValue({
      users: [
        {
          custody_address: custodyAddress,
          display_name: 'ziad',
          verified_addresses: {},
        },
      ],
    });
    await getFarcasterAddresses(FID);
    expect(neynarFetch).toHaveBeenCalledWith(
      `/v2/farcaster/user/bulk?fids=${FID}`
    );
  });

  it('throws when Neynar call fails', async () => {
    vi.mocked(neynarFetch).mockRejectedValue(
      new Error('Neynar API error: 500')
    );
    await expect(getFarcasterAddresses(FID)).rejects.toThrow(
      'Neynar API error'
    );
  });

  it('throws when the response contains no custody address', async () => {
    vi.mocked(neynarFetch).mockResolvedValue({ users: [] });
    await expect(getFarcasterAddresses(FID)).rejects.toThrow(
      'No custody address found for FID'
    );
  });
});
