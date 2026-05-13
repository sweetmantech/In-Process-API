import { describe, it, expect } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';

import validateArtistCollageQuery from '@/lib/og/validateArtistCollageQuery';

const ARTIST = '0x0000000000000000000000000000000000000001';

const makeRequest = (params: Record<string, string> = {}) => {
  const url = new URL('http://localhost/api/og/artist/collage');
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  return new NextRequest(url);
};

describe('validateArtistCollageQuery', () => {
  it('returns typed data when artistAddress is valid', () => {
    const result = validateArtistCollageQuery(
      makeRequest({ artistAddress: ARTIST })
    );

    expect(result).not.toBeInstanceOf(NextResponse);
    expect((result as any).artistAddress).toBe(ARTIST.toLowerCase());
  });

  it('normalizes artistAddress to lowercase', () => {
    const mixed = '0xABCDEF0000000000000000000000000000000001';
    const result = validateArtistCollageQuery(
      makeRequest({ artistAddress: mixed })
    );

    expect(result).not.toBeInstanceOf(NextResponse);
    expect((result as any).artistAddress).toBe(mixed.toLowerCase());
  });

  it('accepts chainId and coerces it to a number', () => {
    const result = validateArtistCollageQuery(
      makeRequest({ artistAddress: ARTIST, chainId: '8453' })
    );

    expect(result).not.toBeInstanceOf(NextResponse);
    expect((result as any).chainId).toBe(8453);
  });

  it('allows chainId to be omitted', () => {
    const result = validateArtistCollageQuery(
      makeRequest({ artistAddress: ARTIST })
    );

    expect(result).not.toBeInstanceOf(NextResponse);
    expect((result as any).chainId).toBeUndefined();
  });

  it('returns 400 when artistAddress is missing', () => {
    const result = validateArtistCollageQuery(makeRequest());

    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(400);
  });

  it('returns 400 when artistAddress is not a valid hex address', () => {
    const result = validateArtistCollageQuery(
      makeRequest({ artistAddress: 'not-an-address' })
    );

    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(400);
  });

  it('returns 400 when artistAddress is too short', () => {
    const result = validateArtistCollageQuery(
      makeRequest({ artistAddress: '0x1234' })
    );

    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(400);
  });
});
