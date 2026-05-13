import { describe, it, expect } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';

import validateGetArweaveUploadsQuery from '@/lib/arweave/validateGetArweaveUploadsQuery';

const makeRequest = (params: Record<string, string> = {}) => {
  const url = new URL('http://localhost/api/uploads');
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  return new NextRequest(url);
};

describe('validateGetArweaveUploadsQuery', () => {
  it('parses limit and page with default aggregation true', () => {
    const result = validateGetArweaveUploadsQuery(
      makeRequest({ limit: '10', page: '2' })
    );

    expect(result).not.toBeInstanceOf(NextResponse);
    expect((result as any).artist).toBeUndefined();
    expect((result as any).aggregation).toBe(true);
    expect((result as any).limit).toBe(10);
    expect((result as any).page).toBe(2);
  });

  it('applies schema defaults when query is empty', () => {
    const result = validateGetArweaveUploadsQuery(makeRequest());

    expect((result as any).limit).toBe(20);
    expect((result as any).page).toBe(1);
    expect((result as any).period).toBeUndefined();
    expect((result as any).artist).toBeUndefined();
    expect((result as any).sort_by).toBe('usdc_cost');
    expect((result as any).sort_order).toBe('desc');
    expect((result as any).aggregation).toBe(true);
  });

  it('returns 400 for invalid query params', () => {
    const result = validateGetArweaveUploadsQuery(
      makeRequest({ limit: '101' })
    );

    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(400);
  });

  it('parses valid period values', () => {
    for (const period of ['day', 'week', 'month', 'all']) {
      const result = validateGetArweaveUploadsQuery(makeRequest({ period }));
      expect((result as any).period).toBe(period);
    }
  });

  it('returns 400 for invalid period value', () => {
    const result = validateGetArweaveUploadsQuery(
      makeRequest({ period: '1d' })
    );

    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(400);
  });

  it('parses artist with default aggregation true', () => {
    const result = validateGetArweaveUploadsQuery(
      makeRequest({ artist: 'alice' })
    );

    expect(result).not.toBeInstanceOf(NextResponse);
    expect((result as any).artist).toBe('alice');
    expect((result as any).aggregation).toBe(true);
  });

  it('parses aggregation=false for per-upload shape', () => {
    const result = validateGetArweaveUploadsQuery(
      makeRequest({ artist: 'alice', aggregation: 'false' })
    );

    expect(result).not.toBeInstanceOf(NextResponse);
    expect((result as any).artist).toBe('alice');
    expect((result as any).aggregation).toBe(false);
  });

  it('parses aggregation=false without artist', () => {
    const result = validateGetArweaveUploadsQuery(
      makeRequest({ aggregation: 'false' })
    );

    expect(result).not.toBeInstanceOf(NextResponse);
    expect((result as any).artist).toBeUndefined();
    expect((result as any).aggregation).toBe(false);
  });

  it('parses aggregation=true explicitly', () => {
    const result = validateGetArweaveUploadsQuery(
      makeRequest({ aggregation: 'true' })
    );

    expect(result).not.toBeInstanceOf(NextResponse);
    expect((result as any).aggregation).toBe(true);
  });

  it('returns 400 for invalid aggregation value', () => {
    const result = validateGetArweaveUploadsQuery(
      makeRequest({ aggregation: 'maybe' })
    );

    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(400);
  });

  it('parses valid sort_by and sort_order', () => {
    const result = validateGetArweaveUploadsQuery(
      makeRequest({ sort_by: 'usdc_cost', sort_order: 'asc' })
    );

    expect(result).not.toBeInstanceOf(NextResponse);
    expect((result as any).sort_by).toBe('usdc_cost');
    expect((result as any).sort_order).toBe('asc');
  });

  it('returns 400 for invalid sort_by', () => {
    for (const sort_by of ['filename', 'username', 'address', 'created_at']) {
      const result = validateGetArweaveUploadsQuery(makeRequest({ sort_by }));
      expect(result).toBeInstanceOf(NextResponse);
      expect((result as NextResponse).status).toBe(400);
    }
  });

  it('returns 400 for invalid sort_order', () => {
    const result = validateGetArweaveUploadsQuery(
      makeRequest({ sort_order: 'newest' })
    );

    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(400);
  });

  it('returns 400 for empty artist', () => {
    const result = validateGetArweaveUploadsQuery(makeRequest({ artist: '' }));

    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(400);
  });
});
