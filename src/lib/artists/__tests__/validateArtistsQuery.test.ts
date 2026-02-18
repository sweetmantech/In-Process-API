import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';

vi.mock('@/authMiddleware', () => ({
  authMiddleware: vi.fn(),
}));

import { authMiddleware } from '@/authMiddleware';
import validateArtistsQuery from '@/lib/artists/validateArtistsQuery';

const CALLER = '0xcaller000000000000000000000000000000000';

const makeRequest = (params: Record<string, string> = {}) => {
  const url = new URL('http://localhost/api/artists');
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  return new NextRequest(url);
};

describe('validateArtistsQuery', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(authMiddleware).mockResolvedValue({
      artistAddress: CALLER,
    } as any);
  });

  it('returns callerAddress and defaults when no params provided', async () => {
    const result = await validateArtistsQuery(makeRequest());

    expect(result).not.toBeInstanceOf(NextResponse);
    expect((result as any).callerAddress).toBe(CALLER);
    expect((result as any).type).toBe('human');
    expect((result as any).limit).toBeUndefined();
    expect((result as any).page).toBeUndefined();
  });

  it('parses limit and page as integers', async () => {
    const result = await validateArtistsQuery(
      makeRequest({ limit: '20', page: '3' })
    );

    expect(result).not.toBeInstanceOf(NextResponse);
    expect((result as any).limit).toBe(20);
    expect((result as any).page).toBe(3);
  });

  it('accepts type=bot', async () => {
    const result = await validateArtistsQuery(makeRequest({ type: 'bot' }));

    expect(result).not.toBeInstanceOf(NextResponse);
    expect((result as any).type).toBe('bot');
  });

  it('returns 400 for invalid type', async () => {
    const result = await validateArtistsQuery(makeRequest({ type: 'invalid' }));

    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(400);
  });

  it('returns 400 when limit exceeds 100', async () => {
    const result = await validateArtistsQuery(makeRequest({ limit: '101' }));

    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(400);
  });

  it('returns 400 when limit is less than 1', async () => {
    const result = await validateArtistsQuery(makeRequest({ limit: '0' }));

    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(400);
  });

  it('returns 400 when page is less than 1', async () => {
    const result = await validateArtistsQuery(makeRequest({ page: '0' }));

    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(400);
  });

  it('returns auth response when authMiddleware fails', async () => {
    vi.mocked(authMiddleware).mockResolvedValue(
      NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    );

    const result = await validateArtistsQuery(makeRequest());

    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(401);
  });
});
