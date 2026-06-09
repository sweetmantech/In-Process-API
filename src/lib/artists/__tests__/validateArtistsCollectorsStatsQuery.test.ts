import { describe, expect, it } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';

import validateArtistsCollectorsStatsQuery from '@/lib/artists/validateArtistsCollectorsStatsQuery';

const makeRequest = (params: Record<string, string> = {}) => {
  const url = new URL('http://localhost/api/artists-collectors');
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  return new NextRequest(url);
};

describe('validateArtistsCollectorsStatsQuery', () => {
  it('returns defaults when query is empty', () => {
    const result = validateArtistsCollectorsStatsQuery(makeRequest());

    expect(result).not.toBeInstanceOf(NextResponse);
    expect(result as any).toMatchObject({
      limit: 20,
      page: 1,
      period: 'all',
      sort_by: 'total_created_count',
      sort_order: 'desc',
    });
    expect((result as any).artist).toBeUndefined();
  });

  it('parses all explicit params', () => {
    const result = validateArtistsCollectorsStatsQuery(
      makeRequest({
        limit: '10',
        page: '2',
        period: 'week',
        artist: 'alice',
        sort_by: 'total_collected_count',
        sort_order: 'asc',
      })
    );

    expect(result).not.toBeInstanceOf(NextResponse);
    expect(result as any).toMatchObject({
      limit: 10,
      page: 2,
      period: 'week',
      artist: 'alice',
      sort_by: 'total_collected_count',
      sort_order: 'asc',
    });
  });

  it('accepts total_created_count as sort_by', () => {
    const result = validateArtistsCollectorsStatsQuery(
      makeRequest({ sort_by: 'total_created_count' })
    );

    expect(result).not.toBeInstanceOf(NextResponse);
    expect((result as any).sort_by).toBe('total_created_count');
  });

  it('returns 400 for limit over 100', () => {
    const result = validateArtistsCollectorsStatsQuery(
      makeRequest({ limit: '101' })
    );

    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(400);
  });

  it('returns 400 for invalid period', () => {
    const result = validateArtistsCollectorsStatsQuery(
      makeRequest({ period: 'year' })
    );

    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(400);
  });

  it('returns 400 for invalid sort_by', () => {
    const result = validateArtistsCollectorsStatsQuery(
      makeRequest({ sort_by: 'unknown_field' })
    );

    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(400);
  });

  it('returns 400 for invalid sort_order', () => {
    const result = validateArtistsCollectorsStatsQuery(
      makeRequest({ sort_order: 'random' })
    );

    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(400);
  });

  it('returns 400 for page less than 1', () => {
    const result = validateArtistsCollectorsStatsQuery(
      makeRequest({ page: '0' })
    );

    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(400);
  });
});
