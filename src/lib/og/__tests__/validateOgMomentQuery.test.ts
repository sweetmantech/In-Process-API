import { describe, it, expect } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';

import validateOgMomentQuery from '@/lib/og/validateOgMomentQuery';

const COLLECTION = '0x0000000000000000000000000000000000000001';

const makeRequest = (params: Record<string, string>) => {
  const url = new URL('http://localhost/api/og/moment');
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  return new NextRequest(url);
};

describe('validateOgMomentQuery', () => {
  it('returns typed query when params match momentSchema', () => {
    const result = validateOgMomentQuery(
      makeRequest({
        collectionAddress: COLLECTION,
        tokenId: '1',
        chainId: '8453',
      })
    );

    expect(result).not.toBeInstanceOf(NextResponse);
    expect(result).toMatchObject({
      collectionAddress: COLLECTION.toLowerCase(),
      tokenId: '1',
      chainId: 8453,
    });
  });

  it('returns 400 when collectionAddress is invalid', () => {
    const result = validateOgMomentQuery(
      makeRequest({
        collectionAddress: 'not-an-address',
        tokenId: '1',
      })
    );

    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(400);
  });

  it('returns 400 when tokenId is missing', () => {
    const result = validateOgMomentQuery(
      makeRequest({
        collectionAddress: COLLECTION,
      })
    );

    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(400);
  });
});
