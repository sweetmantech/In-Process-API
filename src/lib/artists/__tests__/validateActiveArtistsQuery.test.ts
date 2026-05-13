import { describe, expect, it } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';

import validateActiveArtistsQuery from '@/lib/artists/validateActiveArtistsQuery';

const makeRequest = (params: Record<string, string> = {}) => {
  const url = new URL('http://localhost/api/artists/active');
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  return new NextRequest(url);
};

describe('validateActiveArtistsQuery', () => {
  it('returns validated defaults when query is empty', () => {
    const result = validateActiveArtistsQuery(makeRequest());

    expect(result).not.toBeInstanceOf(NextResponse);
    expect((result as any).limit).toBe(20);
    expect((result as any).page).toBe(1);
    expect((result as any).period).toBe('all');
    expect((result as any).artist).toBeUndefined();
  });

  it('parses explicit query params', () => {
    const result = validateActiveArtistsQuery(
      makeRequest({
        limit: '10',
        page: '2',
        period: 'week',
        artist: 'alice',
      })
    );

    expect(result).not.toBeInstanceOf(NextResponse);
    expect(result as any).toMatchObject({
      limit: 10,
      page: 2,
      period: 'week',
      artist: 'alice',
    });
  });

  it('returns 400 for invalid query params', () => {
    const result = validateActiveArtistsQuery(
      makeRequest({ limit: '101', period: 'year' })
    );

    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(400);
  });
});
