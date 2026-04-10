import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/farcaster/getFarcasterAddresses', () => ({
  default: vi.fn(),
}));

vi.mock('@/lib/supabase/in_process_artists/upsertArtistNames', () => ({
  upsertArtistNames: vi.fn(),
}));

import getFarcasterAddresses from '@/lib/farcaster/getFarcasterAddresses';
import { upsertArtistNames } from '@/lib/supabase/in_process_artists/upsertArtistNames';
import isAuthorizedSigner from '@/lib/farcaster/isAuthorizedSigner';

const FID = 12345n;
const custodyAddress = '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266';
const verifiedAddress = '0x70997970c51812dc3a010c7d01b50e0d17dc79c8';
const unknownAddress = '0x1234567890123456789012345678901234567890';
const artistName = 'ziad';

describe('isAuthorizedSigner', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getFarcasterAddresses).mockResolvedValue({
      custodyAddress,
      verifiedAddress,
      artistName,
    });
  });

  it('returns authorized true and verifiedAddress when signer is the custody address', async () => {
    const result = await isAuthorizedSigner(FID, custodyAddress);
    expect(result).toEqual({ authorized: true, verifiedAddress });
  });

  it('returns authorized true when signer is the custody address (case-insensitive)', async () => {
    const result = await isAuthorizedSigner(FID, custodyAddress.toUpperCase());
    expect(result).toEqual({ authorized: true, verifiedAddress });
  });

  it('returns authorized false when signer is not the custody address', async () => {
    const result = await isAuthorizedSigner(FID, unknownAddress);
    expect(result).toEqual({ authorized: false, verifiedAddress });
  });

  it('returns authorized false when signer is the verified address but not the custody address', async () => {
    const result = await isAuthorizedSigner(FID, verifiedAddress);
    expect(result).toEqual({ authorized: false, verifiedAddress });
  });

  it('upserts artist name when authorized and artistName is present', async () => {
    await isAuthorizedSigner(FID, custodyAddress);
    expect(upsertArtistNames).toHaveBeenCalledWith(
      new Map([[verifiedAddress, artistName]])
    );
  });

  it('does not upsert artist name when not authorized', async () => {
    await isAuthorizedSigner(FID, unknownAddress);
    expect(upsertArtistNames).not.toHaveBeenCalled();
  });

  it('does not upsert artist name when authorized but artistName is absent', async () => {
    vi.mocked(getFarcasterAddresses).mockResolvedValue({
      custodyAddress,
      verifiedAddress,
      artistName: undefined,
    });
    await isAuthorizedSigner(FID, custodyAddress);
    expect(upsertArtistNames).not.toHaveBeenCalled();
  });
});
