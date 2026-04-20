import { describe, it, expect } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';

import validateMomentQuery from '@/lib/moment/validateMomentQuery';

const COLLECTION = '0x0000000000000000000000000000000000000001';

const makeRequest = (params: Record<string, string>) => {
  const url = new URL('http://localhost/api/moment');
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  return new NextRequest(url);
};

describe('validateMomentQuery', () => {
  it('returns typed moment when all params are valid', () => {
    const result = validateMomentQuery(
      makeRequest({
        collectionAddress: COLLECTION,
        tokenId: '1',
        chainId: '8453',
      })
    );

    expect(result).not.toBeInstanceOf(NextResponse);
    expect((result as any).collectionAddress).toBe(COLLECTION);
    expect((result as any).tokenId).toBe('1');
    expect((result as any).chainId).toBe(8453);
  });

  it('coerces chainId string to number', () => {
    const result = validateMomentQuery(
      makeRequest({
        collectionAddress: COLLECTION,
        tokenId: '7',
        chainId: '84532',
      })
    );

    expect(result).not.toBeInstanceOf(NextResponse);
    expect((result as any).chainId).toBe(84532);
  });

  it('defaults chainId when not provided', () => {
    const result = validateMomentQuery(
      makeRequest({
        collectionAddress: COLLECTION,
        tokenId: '1',
      })
    );

    expect(result).not.toBeInstanceOf(NextResponse);
    expect(typeof (result as any).chainId).toBe('number');
  });

  it('returns 400 when collectionAddress is missing', () => {
    const result = validateMomentQuery(
      makeRequest({
        tokenId: '1',
        chainId: '8453',
      })
    );

    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(400);
  });

  it('returns 400 when collectionAddress is malformed', () => {
    const result = validateMomentQuery(
      makeRequest({
        collectionAddress: 'not-an-address',
        tokenId: '1',
        chainId: '8453',
      })
    );

    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(400);
  });

  it('returns 400 when tokenId is missing', () => {
    const result = validateMomentQuery(
      makeRequest({
        collectionAddress: COLLECTION,
        chainId: '8453',
      })
    );

    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(400);
  });

  it('returns 400 when chainId is not numeric', () => {
    const result = validateMomentQuery(
      makeRequest({
        collectionAddress: COLLECTION,
        tokenId: '1',
        chainId: 'abc',
      })
    );

    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(400);
  });
});
