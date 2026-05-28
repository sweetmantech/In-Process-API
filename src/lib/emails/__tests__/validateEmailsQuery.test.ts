import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';

vi.mock('@/authMiddleware', () => ({ authMiddleware: vi.fn() }));

import { authMiddleware } from '@/authMiddleware';
import validateEmailsQuery from '@/lib/emails/validateEmailsQuery';

const CALLER = '0xaf1452d289e22fbd0dea9d5097353c72a90fac33';

const makeRequest = (params: Record<string, string> = {}) => {
  const url = new URL('http://localhost/api/emails');
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  return new NextRequest(url);
};

describe('validateEmailsQuery', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns validated data with callerAddress when auth succeeds', async () => {
    vi.mocked(authMiddleware).mockResolvedValue({
      primaryWallet: CALLER,
    } as any);

    const result = await validateEmailsQuery(
      makeRequest({
        artist_address: '0x0000000000000000000000000000000000000001',
      })
    );

    expect(result).not.toBeInstanceOf(NextResponse);
    expect((result as any).callerAddress).toBe(CALLER);
    expect((result as any).artist_address).toBe(
      '0x0000000000000000000000000000000000000001'
    );
  });

  it('returns auth response when auth fails', async () => {
    vi.mocked(authMiddleware).mockResolvedValue(
      NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    );

    const result = await validateEmailsQuery(makeRequest());

    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(401);
  });

  it('returns 400 when limit is not a valid number', async () => {
    vi.mocked(authMiddleware).mockResolvedValue({
      primaryWallet: CALLER,
    } as any);

    const result = await validateEmailsQuery(makeRequest({ limit: 'abc' }));

    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(400);
  });

  it('returns 400 when limit exceeds 100', async () => {
    vi.mocked(authMiddleware).mockResolvedValue({
      primaryWallet: CALLER,
    } as any);

    const result = await validateEmailsQuery(makeRequest({ limit: '101' }));

    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(400);
  });

  it('coerces limit to a number', async () => {
    vi.mocked(authMiddleware).mockResolvedValue({
      primaryWallet: CALLER,
    } as any);

    const result = await validateEmailsQuery(makeRequest({ limit: '10' }));

    expect((result as any).limit).toBe(10);
  });

  it('returns undefined cursor and limit when not provided', async () => {
    vi.mocked(authMiddleware).mockResolvedValue({
      primaryWallet: CALLER,
    } as any);

    const result = await validateEmailsQuery(makeRequest());

    expect((result as any).cursor).toBeUndefined();
    expect((result as any).limit).toBeUndefined();
  });
});
