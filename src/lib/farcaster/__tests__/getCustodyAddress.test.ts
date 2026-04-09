import { describe, it, expect, vi, beforeEach } from 'vitest';
import { hexToBytes } from 'viem';

vi.mock('@/lib/farcaster/hubClient', () => ({
  default: { getIdRegistryOnChainEvent: vi.fn() },
}));

import hubClient from '@/lib/farcaster/hubClient';
import getCustodyAddress from '@/lib/farcaster/getCustodyAddress';

const FID = 12345n;
const custodyAddress = '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266';
const custodyAddressBytes = hexToBytes(custodyAddress as `0x${string}`);

function mockHubOk(to: Uint8Array) {
  vi.mocked(hubClient.getIdRegistryOnChainEvent).mockResolvedValue({
    isErr: () => false,
    value: { idRegisterEventBody: { to } },
  } as any);
}

describe('getCustodyAddress', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns lowercased custody address', async () => {
    mockHubOk(custodyAddressBytes);
    const result = await getCustodyAddress(FID);
    expect(result).toBe(custodyAddress.toLowerCase());
  });

  it('calls the Hub with the correct FID', async () => {
    mockHubOk(custodyAddressBytes);
    await getCustodyAddress(FID);
    expect(hubClient.getIdRegistryOnChainEvent).toHaveBeenCalledWith({
      fid: Number(FID),
    });
  });

  it('throws when the Hub call fails', async () => {
    vi.mocked(hubClient.getIdRegistryOnChainEvent).mockResolvedValue({
      isErr: () => true,
      error: { message: 'hub error' },
    } as any);

    await expect(getCustodyAddress(FID)).rejects.toThrow(
      'Failed to fetch custody address from Hub'
    );
  });

  it('throws when the response contains no custody address', async () => {
    mockHubOk(new Uint8Array(0));
    await expect(getCustodyAddress(FID)).rejects.toThrow(
      'No custody address found for FID'
    );
  });
});
