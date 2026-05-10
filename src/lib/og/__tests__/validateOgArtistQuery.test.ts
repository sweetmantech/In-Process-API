import { describe, it, expect } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';

import validateOgArtistQuery from '@/lib/og/validateOgArtistQuery';

const ARTIST = '0x0000000000000000000000000000000000000001';

const makeRequest = (params: Record<string, string> = {}) => {
  const url = new URL('http://localhost/api/og/artist');
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  return new NextRequest(url);
};

describe('validateOgArtistQuery', () => {
  it('returns typed query when params are valid', () => {
    const result = validateOgArtistQuery(
      makeRequest({ artistAddress: ARTIST, chainId: '8453' })
    );

    expect(result).not.toBeInstanceOf(NextResponse);
    expect(result).toMatchObject({
      artistAddress: ARTIST.toLowerCase(),
      chainId: 8453,
    });
  });

  it('defaults chainId to CHAIN_ID when omitted', () => {
    const result = validateOgArtistQuery(
      makeRequest({ artistAddress: ARTIST })
    );

    expect(result).not.toBeInstanceOf(NextResponse);
    expect((result as any).chainId).toBeTypeOf('number');
  });

  it('normalizes artistAddress to lowercase', () => {
    const mixed = '0xABCDEF0000000000000000000000000000000001';
    const result = validateOgArtistQuery(makeRequest({ artistAddress: mixed }));

    expect(result).not.toBeInstanceOf(NextResponse);
    expect((result as any).artistAddress).toBe(mixed.toLowerCase());
  });

  it('returns 400 when artistAddress is missing', () => {
    const result = validateOgArtistQuery(makeRequest());

    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(400);
  });

  it('returns 400 when artistAddress is not a valid hex address', () => {
    const result = validateOgArtistQuery(
      makeRequest({ artistAddress: 'not-an-address' })
    );

    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(400);
  });

  it('returns 400 when artistAddress is too short', () => {
    const result = validateOgArtistQuery(
      makeRequest({ artistAddress: '0x1234' })
    );

    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(400);
  });
});
