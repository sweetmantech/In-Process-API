import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/farcaster/getCustodyAddress', () => ({
  default: vi.fn(),
}));

vi.mock('@/lib/farcaster/neynarFetch', () => ({
  default: vi.fn(),
}));

import getCustodyAddress from '@/lib/farcaster/getCustodyAddress';
import neynarFetch from '@/lib/farcaster/neynarFetch';
import isAuthorizedSigner from '@/lib/farcaster/isAuthorizedSigner';

const FID = 12345n;
const custodyAddress = '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266';
const verifiedAddress = '0x70997970c51812dc3a010c7d01b50e0d17dc79c8';
const unknownAddress = '0x1234567890123456789012345678901234567890';

function mockVerificationsFetch(addresses: string[]): void {
  vi.mocked(neynarFetch).mockResolvedValue({
    verifications: addresses.map((address) => ({ address, protocol: 'evm' })),
  });
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
    vi.mocked(neynarFetch).mockRejectedValue(new Error('Neynar error'));
    const result = await isAuthorizedSigner(FID, unknownAddress);
    expect(result).toEqual({ authorized: false, custodyAddress });
  });

  it('returns authorized false and custodyAddress when verifications list is empty', async () => {
    mockVerificationsFetch([]);
    const result = await isAuthorizedSigner(FID, unknownAddress);
    expect(result).toEqual({ authorized: false, custodyAddress });
  });

  it('does not call verifications when signer is the custody address', async () => {
    await isAuthorizedSigner(FID, custodyAddress);
    expect(neynarFetch).not.toHaveBeenCalled();
  });
});
