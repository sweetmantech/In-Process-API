import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';

vi.mock('@/authMiddleware', () => ({ authMiddleware: vi.fn() }));

import { authMiddleware } from '@/authMiddleware';
import validateGetArweaveLogsQuery from '@/lib/arweave/validateGetArweaveLogsQuery';

const CALLER = '0xaf1452d289e22fbd0dea9d5097353c72a90fac33';
const NON_ADMIN = '0x1111111111111111111111111111111111111111';

const makeRequest = (params: Record<string, string> = {}) => {
  const url = new URL('http://localhost/api/arweave/logs');
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  return new NextRequest(url);
};

describe('validateGetArweaveLogsQuery', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('sets artist to caller address for non-admin callers', async () => {
    vi.mocked(authMiddleware).mockResolvedValue({
      artistAddress: NON_ADMIN,
    } as any);

    const result = await validateGetArweaveLogsQuery(
      makeRequest({ limit: '10', page: '2' })
    );

    expect(result).not.toBeInstanceOf(NextResponse);
    expect((result as any).artist).toBe(NON_ADMIN.toLowerCase());
    expect((result as any).limit).toBe(10);
    expect((result as any).page).toBe(2);
  });

  it('returns auth response when auth fails', async () => {
    vi.mocked(authMiddleware).mockResolvedValue(
      NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    );

    const result = await validateGetArweaveLogsQuery(makeRequest());

    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(401);
  });

  it('applies schema defaults when query is empty', async () => {
    vi.mocked(authMiddleware).mockResolvedValue({
      artistAddress: CALLER,
    } as any);

    const result = await validateGetArweaveLogsQuery(makeRequest());

    expect((result as any).limit).toBe(20);
    expect((result as any).page).toBe(1);
    expect((result as any).period).toBeUndefined();
    expect((result as any).artist).toBeUndefined();
  });

  it('returns 400 for invalid query params', async () => {
    vi.mocked(authMiddleware).mockResolvedValue({
      artistAddress: CALLER,
    } as any);

    const result = await validateGetArweaveLogsQuery(
      makeRequest({ limit: '101' })
    );

    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(400);
  });

  it('parses valid period values', async () => {
    vi.mocked(authMiddleware).mockResolvedValue({
      artistAddress: CALLER,
    } as any);

    for (const period of ['day', 'week', 'month', 'all']) {
      const result = await validateGetArweaveLogsQuery(makeRequest({ period }));
      expect((result as any).period).toBe(period);
    }
  });

  it('returns 400 for invalid period value', async () => {
    vi.mocked(authMiddleware).mockResolvedValue({
      artistAddress: CALLER,
    } as any);

    const result = await validateGetArweaveLogsQuery(
      makeRequest({ period: '1d' })
    );

    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(400);
  });

  it('parses valid artist value', async () => {
    vi.mocked(authMiddleware).mockResolvedValue({
      artistAddress: CALLER,
    } as any);

    const result = await validateGetArweaveLogsQuery(
      makeRequest({ artist: 'alice' })
    );

    expect(result).not.toBeInstanceOf(NextResponse);
    expect((result as any).artist).toBe('alice');
  });

  it('returns 400 for empty artist', async () => {
    vi.mocked(authMiddleware).mockResolvedValue({
      artistAddress: CALLER,
    } as any);

    const result = await validateGetArweaveLogsQuery(
      makeRequest({ artist: '' })
    );

    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(400);
  });
});
