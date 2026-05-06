import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';

vi.mock('@/authMiddleware', () => ({ authMiddleware: vi.fn() }));

import { authMiddleware } from '@/authMiddleware';
import validateGetArweaveLogsQuery from '@/lib/arweave/validateGetArweaveLogsQuery';

const CALLER = '0xaf1452d289e22fbd0dea9d5097353c72a90fac33';

const makeRequest = (params: Record<string, string> = {}) => {
  const url = new URL('http://localhost/api/arweave/logs');
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  return new NextRequest(url);
};

describe('validateGetArweaveLogsQuery', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns validated query with caller artistAddress', async () => {
    vi.mocked(authMiddleware).mockResolvedValue({
      artistAddress: CALLER,
    } as any);

    const result = await validateGetArweaveLogsQuery(
      makeRequest({ limit: '10', page: '2' })
    );

    expect(result).not.toBeInstanceOf(NextResponse);
    expect((result as any).artistAddress).toBe(CALLER);
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
});
