import { describe, it, expect } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import { CHAIN_ID } from '@/lib/consts';

import validateGetCollectionsQuery from '@/lib/collection/validateGetCollectionsQuery';

const makeRequest = (params: Record<string, string> = {}) => {
  const url = new URL('http://localhost/api/collections');
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  return new NextRequest(url);
};

describe('validateGetCollectionsQuery', () => {
  it('applies defaults when query is empty', () => {
    const result = validateGetCollectionsQuery(makeRequest());

    expect(result).not.toBeNull();
    expect((result as any).limit).toBe(100);
    expect((result as any).page).toBe(1);
    expect((result as any).chain_id).toBe(CHAIN_ID);
    expect((result as any).artist).toBeUndefined();
  });

  it('parses explicit limit and page', () => {
    const result = validateGetCollectionsQuery(
      makeRequest({ limit: '10', page: '3' })
    );

    expect((result as any).limit).toBe(10);
    expect((result as any).page).toBe(3);
  });

  it('clamps limit to 100', () => {
    const result = validateGetCollectionsQuery(makeRequest({ limit: '200' }));

    expect(result).toBeNull();
  });

  it('normalizes artist address to lowercase', () => {
    const ARTIST = '0xAf1452D289E22FBd0DEA9D5097353c72a90FAC33';
    const result = validateGetCollectionsQuery(makeRequest({ artist: ARTIST }));

    expect((result as any).artist).toBe(ARTIST.toLowerCase());
  });

  it('returns null for invalid artist address', () => {
    const result = validateGetCollectionsQuery(
      makeRequest({ artist: 'not-an-address' })
    );

    expect(result).toBeNull();
  });

  it('parses chain_id', () => {
    const result = validateGetCollectionsQuery(
      makeRequest({ chain_id: '84532' })
    );

    expect((result as any).chain_id).toBe(84532);
  });

  it('returns null for non-numeric limit', () => {
    const result = validateGetCollectionsQuery(makeRequest({ limit: 'abc' }));

    expect(result).toBeNull();
  });

  it('returns null for page below 1', () => {
    const result = validateGetCollectionsQuery(makeRequest({ page: '0' }));

    expect(result).toBeNull();
  });
});
