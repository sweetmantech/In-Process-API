import { describe, it, expect } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import validateArtistWalletsQuery from '@/lib/artists/validateArtistWalletsQuery';
import { AuthErrorTypes } from '@/errors';
import { AuthMethod } from '@/types/auth';

const makeRequest = (
  params: Record<string, string> = {},
  headers: Record<string, string> = {}
) => {
  const url = new URL('http://localhost/api/artists/wallets');
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  return new NextRequest(url, { headers: new Headers(headers) });
};

describe('validateArtistWalletsQuery', () => {
  it('returns Privy auth when bearer token is provided', () => {
    const result = validateArtistWalletsQuery(
      makeRequest({}, { authorization: 'Bearer privy-token' })
    );

    expect(result).not.toBeInstanceOf(NextResponse);
    expect(result).toEqual({
      method: AuthMethod.Privy,
      token: 'privy-token',
    });
  });

  it('returns Farcaster auth when farcaster token is provided', () => {
    const result = validateArtistWalletsQuery(
      makeRequest({}, { authorization: 'Farcaster fc-token' })
    );

    expect(result).not.toBeInstanceOf(NextResponse);
    expect(result).toEqual({
      method: AuthMethod.Farcaster,
      token: 'fc-token',
    });
  });

  it('returns ApiKey auth when x-api-key header is provided', () => {
    const result = validateArtistWalletsQuery(
      makeRequest({}, { 'x-api-key': 'api-key-value' })
    );

    expect(result).not.toBeInstanceOf(NextResponse);
    expect(result).toEqual({
      method: AuthMethod.ApiKey,
      token: 'api-key-value',
    });
  });

  it('prefers bearer token over farcaster token and api key', () => {
    const result = validateArtistWalletsQuery(
      makeRequest(
        {},
        {
          authorization: 'Bearer privy-token',
          'x-api-key': 'api-key-value',
        }
      )
    );

    expect(result).toEqual({
      method: AuthMethod.Privy,
      token: 'privy-token',
    });
  });

  it('returns 401 when no auth credentials are provided', async () => {
    const result = validateArtistWalletsQuery(makeRequest());

    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(401);
    expect(await (result as NextResponse).json()).toEqual({
      message: AuthErrorTypes.UNAUTHORIZED,
    });
  });
});
