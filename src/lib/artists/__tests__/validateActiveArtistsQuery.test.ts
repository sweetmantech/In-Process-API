import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';

vi.mock('@/authMiddleware', () => ({
  authMiddleware: vi.fn(),
}));

vi.mock('@/lib/consts', () => ({
  ADMIN_ADDRESSES: ['0xadmin0000000000000000000000000000000000'],
}));

import { authMiddleware } from '@/authMiddleware';
import validateActiveArtistsQuery from '@/lib/artists/validateActiveArtistsQuery';

const makeRequest = (params: Record<string, string> = {}) => {
  const url = new URL('http://localhost/api/artists/active');
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  return new NextRequest(url);
};

describe('validateActiveArtistsQuery', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(authMiddleware).mockResolvedValue({
      artistAddress: '0xadmin0000000000000000000000000000000000',
    } as any);
  });

  it('returns validated defaults for admin caller', async () => {
    const result = await validateActiveArtistsQuery(makeRequest());

    expect(result).not.toBeInstanceOf(NextResponse);
    expect((result as any).limit).toBe(20);
    expect((result as any).page).toBe(1);
    expect((result as any).period).toBe('all');
    expect((result as any).artist).toBeUndefined();
  });

  it('parses explicit query params', async () => {
    const result = await validateActiveArtistsQuery(
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

  it('returns auth response when authMiddleware fails', async () => {
    vi.mocked(authMiddleware).mockResolvedValue(
      NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    );

    const result = await validateActiveArtistsQuery(makeRequest());

    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(401);
  });

  it('returns 403 for non-admin caller', async () => {
    vi.mocked(authMiddleware).mockResolvedValue({
      artistAddress: '0x0000000000000000000000000000000000000001',
    } as any);

    const result = await validateActiveArtistsQuery(makeRequest());

    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(403);
    expect(await (result as NextResponse).json()).toEqual({
      message: 'Forbidden',
    });
  });

  it('returns 400 for invalid query params', async () => {
    const result = await validateActiveArtistsQuery(
      makeRequest({ limit: '101', period: 'year' })
    );

    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(400);
  });
});
