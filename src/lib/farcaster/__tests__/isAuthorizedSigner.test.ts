import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/farcaster/getCustodyAddress', () => ({
  default: vi.fn(),
}));

import getCustodyAddress from '@/lib/farcaster/getCustodyAddress';
import isAuthorizedSigner from '@/lib/farcaster/isAuthorizedSigner';

const FID = 12345n;
const custodyAddress = '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266';
const verifiedAddress = '0x70997970c51812dc3a010c7d01b50e0d17dc79c8';
const unknownAddress = '0x1234567890123456789012345678901234567890';

function mockVerificationsFetch(addresses: string[]): void {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          messages: addresses.map((address) => ({
            data: { verificationAddEthOrSolAddressBody: { address } },
          })),
        }),
    })
  );
}

describe('isAuthorizedSigner', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.unstubAllGlobals();
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
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }));

    const result = await isAuthorizedSigner(FID, unknownAddress);
    expect(result).toEqual({ authorized: false, custodyAddress });
  });

  it('returns authorized false and custodyAddress when verifications messages list is empty', async () => {
    mockVerificationsFetch([]);

    const result = await isAuthorizedSigner(FID, unknownAddress);
    expect(result).toEqual({ authorized: false, custodyAddress });
  });

  it('does not fetch verifications when signer is the custody address', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    await isAuthorizedSigner(FID, custodyAddress);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
