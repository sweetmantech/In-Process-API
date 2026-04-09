import { describe, it, expect, vi, beforeEach } from 'vitest';
import { hexToBytes } from 'viem';

vi.mock('@/lib/farcaster/getCustodyAddress', () => ({
  default: vi.fn(),
}));

vi.mock('@/lib/farcaster/hubClient', () => ({
  default: { getAllVerificationMessagesByFid: vi.fn() },
}));

import getCustodyAddress from '@/lib/farcaster/getCustodyAddress';
import hubClient from '@/lib/farcaster/hubClient';
import isAuthorizedSigner from '@/lib/farcaster/isAuthorizedSigner';

const FID = 12345n;
const custodyAddress = '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266';
const verifiedAddress = '0x70997970c51812dc3a010c7d01b50e0d17dc79c8';
const unknownAddress = '0x1234567890123456789012345678901234567890';

function mockVerificationsFetch(addresses: string[]): void {
  vi.mocked(hubClient.getAllVerificationMessagesByFid).mockResolvedValue({
    isErr: () => false,
    value: {
      messages: addresses.map((address) => ({
        data: {
          verificationAddAddressBody: {
            address: hexToBytes(address as `0x${string}`),
          },
        },
      })),
    },
  } as any);
}

describe('isAuthorizedSigner', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getCustodyAddress).mockResolvedValue(custodyAddress);
  });

  it('returns authorized true and custodyAddress when signer is the custody address', async () => {
    const result = await isAuthorizedSigner(FID, custodyAddress);
    expect(result).toEqual({ authorized: true, custodyAddress });
  });

  it('returns authorized true when signer is the custody address (case-insensitive)', async () => {
    const result = await isAuthorizedSigner(FID, custodyAddress.toUpperCase());
    expect(result).toEqual({ authorized: true, custodyAddress });
  });

  it('returns authorized true and custodyAddress when signer is a verified address', async () => {
    mockVerificationsFetch([verifiedAddress]);
    const result = await isAuthorizedSigner(FID, verifiedAddress);
    expect(result).toEqual({ authorized: true, custodyAddress });
  });

  it('returns authorized true when signer matches a verified address case-insensitively', async () => {
    mockVerificationsFetch([verifiedAddress]);
    const result = await isAuthorizedSigner(FID, verifiedAddress.toUpperCase());
    expect(result).toEqual({ authorized: true, custodyAddress });
  });

  it('returns authorized false and custodyAddress when signer is not authorized', async () => {
    mockVerificationsFetch([verifiedAddress]);
    const result = await isAuthorizedSigner(FID, unknownAddress);
    expect(result).toEqual({ authorized: false, custodyAddress });
  });

  it('returns authorized false and custodyAddress when verifications fetch fails', async () => {
    vi.mocked(hubClient.getAllVerificationMessagesByFid).mockResolvedValue({
      isErr: () => true,
      error: { message: 'hub error' },
    } as any);
    const result = await isAuthorizedSigner(FID, unknownAddress);
    expect(result).toEqual({ authorized: false, custodyAddress });
  });

  it('returns authorized false and custodyAddress when verifications messages list is empty', async () => {
    mockVerificationsFetch([]);
    const result = await isAuthorizedSigner(FID, unknownAddress);
    expect(result).toEqual({ authorized: false, custodyAddress });
  });

  it('does not call verifications when signer is the custody address', async () => {
    await isAuthorizedSigner(FID, custodyAddress);
    expect(hubClient.getAllVerificationMessagesByFid).not.toHaveBeenCalled();
  });
});
