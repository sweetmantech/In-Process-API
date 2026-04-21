import { describe, it, expect } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import validateMetadataQuery from '@/lib/metadata/validateMetadataQuery';

const makeRequest = (params: Record<string, string>) => {
  const url = new URL('http://localhost/api/metadata');
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  return new NextRequest(url);
};

describe('validateMetadataQuery', () => {
  it('returns uri when present', () => {
    const result = validateMetadataQuery(makeRequest({ uri: 'ipfs://QmABC' }));
    expect(result).toEqual({ uri: 'ipfs://QmABC' });
  });

  it('returns 400 when uri is missing', () => {
    const result = validateMetadataQuery(makeRequest({}));
    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(400);
  });
});
