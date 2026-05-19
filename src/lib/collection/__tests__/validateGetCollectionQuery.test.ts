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
  it('returns validated data for valid input', () => {
    const result = validateGetCollectionQuery(
      makeRequest({ collectionAddress: '0xAbCdEf1234567890AbCdEf1234567890AbCdEf12' })
    );

    expect(result).not.toBeInstanceOf(NextResponse);
    expect((result as any).collectionAddress).toBe('0xabcdef1234567890abcdef1234567890abcdef12');
    expect((result as any).chainId).toBe(CHAIN_ID);
  });

  it('lowercases collectionAddress', () => {
    const result = validateGetCollectionQuery(
      makeRequest({ collectionAddress: '0xABCDEF' })
    );

    expect((result as any).collectionAddress).toBe('0xabcdef');
  });

  it('parses explicit chainId', () => {
    const result = validateGetCollectionQuery(
      makeRequest({ collectionAddress: '0xabc', chainId: '84532' })
    );

    expect((result as any).chainId).toBe(84532);
  });

  it('returns 400 when collectionAddress is missing', () => {
    const result = validateGetCollectionQuery(makeRequest());

    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(400);
  });

  it('returns 400 when collectionAddress is empty string', () => {
    const result = validateGetCollectionQuery(makeRequest({ collectionAddress: '' }));

    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(400);
  });

  it('defaults chainId to CHAIN_ID when not provided', () => {
    const result = validateGetCollectionQuery(
      makeRequest({ collectionAddress: '0xabc' })
    );

    expect((result as any).chainId).toBe(CHAIN_ID);
  });
});
