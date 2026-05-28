import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/farcaster/getFarcasterWalletByFid', () => ({
  default: vi.fn(),
}));

import getFarcasterWalletByFid from '@/lib/farcaster/getFarcasterWalletByFid';
import isAuthorizedSigner from '@/lib/farcaster/isAuthorizedSigner';

const FID = BigInt(12345);
const custodyAddress = '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266';
const verifiedAddress = '0x70997970c51812dc3a010c7d01b50e0d17dc79c8';
const unknownAddress = '0x1234567890123456789012345678901234567890';
const artistName = 'ziad';

describe('isAuthorizedSigner', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getFarcasterWalletByFid).mockResolvedValue({
      custodyAddress,
      verifiedAddress,
      artistName,
    });
  });

  it('returns authorized true and verifiedAddress when signer is the custody address', async () => {
    const result = await isAuthorizedSigner(FID, custodyAddress);
    expect(result).toEqual({
      authorized: true,
      verifiedAddress,
      artistName,
    });
  });

  it('returns authorized true when signer is the custody address (case-insensitive)', async () => {
    const result = await isAuthorizedSigner(FID, custodyAddress.toUpperCase());
    expect(result).toEqual({
      authorized: true,
      verifiedAddress,
      artistName,
    });
  });

  it('returns authorized false when signer is not the custody address', async () => {
    const result = await isAuthorizedSigner(FID, unknownAddress);
    expect(result).toEqual({
      authorized: false,
      verifiedAddress,
      artistName,
    });
  });

  it('returns authorized false when signer is the verified address but not the custody address', async () => {
    const result = await isAuthorizedSigner(FID, verifiedAddress);
    expect(result).toEqual({
      authorized: false,
      verifiedAddress,
      artistName,
    });
  });
});
