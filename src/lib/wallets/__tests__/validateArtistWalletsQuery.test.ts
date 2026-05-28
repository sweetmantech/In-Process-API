import { describe, it, expect } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import validateArtistWalletsQuery from '@/lib/wallets/validateArtistWalletsQuery';

const ARTIST_ID = '550e8400-e29b-41d4-a716-446655440000';

const makeRequest = (params: Record<string, string> = {}) => {
  const url = new URL('http://localhost/api/artists/wallets');
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  return new NextRequest(url);
};

describe('validateArtistWalletsQuery', () => {
  it('returns artistId when query param is valid', () => {
    const result = validateArtistWalletsQuery(
      makeRequest({ artistId: ARTIST_ID })
    );

    expect(result).not.toBeInstanceOf(NextResponse);
    expect(result).toEqual({ artistId: ARTIST_ID });
  });

  it('returns 400 when artistId is missing', async () => {
    const result = validateArtistWalletsQuery(makeRequest());

    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(400);
    expect(await (result as NextResponse).json()).toEqual({
      message: 'Invalid or missing artistId query parameter',
    });
  });

  it('returns 400 when artistId is not a uuid', async () => {
    const result = validateArtistWalletsQuery(
      makeRequest({ artistId: 'not-a-uuid' })
    );

    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(400);
  });
});
