import { describe, expect, it } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';

import validateCollectorsQuery from '@/lib/collectors/validateCollectorsQuery';

const makeRequest = (params: Record<string, string> = {}) => {
  const url = new URL('http://localhost/api/collectors');
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  return new NextRequest(url);
};

describe('validateCollectorsQuery', () => {
  it('returns defaults when query is empty', () => {
    const result = validateCollectorsQuery(makeRequest());

    expect(result).not.toBeInstanceOf(NextResponse);
    expect(result as any).toMatchObject({
      limit: 20,
      page: 1,
      period: 'all',
      sort_by: 'collected_count',
      sort_order: 'desc',
    });
    expect((result as any).artist).toBeUndefined();
  });

  it('parses all explicit params', () => {
    const result = validateCollectorsQuery(
      makeRequest({
        limit: '10',
        page: '2',
        period: 'week',
        artist: 'alice',
        sort_by: 'eth_spent',
        sort_order: 'asc',
      })
    );

    expect(result).not.toBeInstanceOf(NextResponse);
    expect(result as any).toMatchObject({
      limit: 10,
      page: 2,
      period: 'week',
      artist: 'alice',
      sort_by: 'eth_spent',
      sort_order: 'asc',
    });
  });

  it('accepts usdc_spent as sort_by', () => {
    const result = validateCollectorsQuery(
      makeRequest({ sort_by: 'usdc_spent' })
    );

    expect(result).not.toBeInstanceOf(NextResponse);
    expect((result as any).sort_by).toBe('usdc_spent');
  });

  it('returns 400 for limit over 100', () => {
    const result = validateCollectorsQuery(makeRequest({ limit: '101' }));

    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(400);
  });

  it('returns 400 for invalid period', () => {
    const result = validateCollectorsQuery(makeRequest({ period: 'year' }));

    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(400);
  });

  it('returns 400 for invalid sort_by', () => {
    const result = validateCollectorsQuery(
      makeRequest({ sort_by: 'unknown_field' })
    );

    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(400);
  });

  it('returns 400 for invalid sort_order', () => {
    const result = validateCollectorsQuery(
      makeRequest({ sort_order: 'random' })
    );

    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(400);
  });

  it('returns 400 for page less than 1', () => {
    const result = validateCollectorsQuery(makeRequest({ page: '0' }));

    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(400);
  });
});
