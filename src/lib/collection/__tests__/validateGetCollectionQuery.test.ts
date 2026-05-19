import { describe, it, expect } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import { CHAIN_ID } from '@/lib/consts';

import validateGetCollectionQuery from '@/lib/collection/validateGetCollectionQuery';

const makeRequest = (params: Record<string, string> = {}) => {
  const url = new URL('http://localhost/api/collection');
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  return new NextRequest(url);
};

describe('validateGetCollectionQuery', () => {
  const COLLECTION = '0xAbCdEf1234567890AbCdEf1234567890AbCdEf12';

  it('returns validated data for valid input', () => {
    const result = validateGetCollectionQuery(
      makeRequest({ collectionAddress: COLLECTION })
    );

    expect(result).not.toBeInstanceOf(NextResponse);
    expect((result as any).collectionAddress).toBe(COLLECTION.toLowerCase());
    expect((result as any).chainId).toBe(CHAIN_ID);
  });

  it('normalizes collectionAddress to lowercase', () => {
    const result = validateGetCollectionQuery(
      makeRequest({ collectionAddress: COLLECTION })
    );

    expect((result as any).collectionAddress).toBe(COLLECTION.toLowerCase());
  });

  it('parses explicit chainId', () => {
    const result = validateGetCollectionQuery(
      makeRequest({ collectionAddress: COLLECTION, chainId: '84532' })
    );

    expect((result as any).chainId).toBe(84532);
  });

  it('returns 400 when collectionAddress is missing', () => {
    const result = validateGetCollectionQuery(makeRequest());

    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(400);
  });

  it('returns 400 when collectionAddress is not a valid address', () => {
    const result = validateGetCollectionQuery(
      makeRequest({ collectionAddress: 'not-an-address' })
    );

    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(400);
  });

  it('defaults chainId to CHAIN_ID when not provided', () => {
    const result = validateGetCollectionQuery(
      makeRequest({ collectionAddress: COLLECTION })
    );

    expect((result as any).chainId).toBe(CHAIN_ID);
  });
});
