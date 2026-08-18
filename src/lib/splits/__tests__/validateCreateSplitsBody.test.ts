import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';

vi.mock('@/authMiddleware', () => ({
  authMiddleware: vi.fn(),
}));

import { authMiddleware } from '@/authMiddleware';
import validateCreateSplitsBody from '@/lib/splits/validateCreateSplitsBody';

const CALLER = '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
const RECIPIENT = '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb';

const validBody = {
  splits: [
    { address: CALLER, percentAllocation: 60 },
    { address: RECIPIENT, percentAllocation: 40 },
  ],
};

const makeRequest = (body: unknown) =>
  new NextRequest('http://localhost/api/splits', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'content-type': 'application/json' },
  });

describe('validateCreateSplitsBody', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(authMiddleware).mockResolvedValue({
      primaryWallet: CALLER,
      artistId: 'artist-uuid',
      wallets: [],
    } as any);
  });

  it('returns 401 when auth fails', async () => {
    vi.mocked(authMiddleware).mockResolvedValue(
      NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    );

    const result = await validateCreateSplitsBody(makeRequest(validBody));

    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(401);
  });

  it('returns 400 when splits are missing', async () => {
    const result = await validateCreateSplitsBody(makeRequest({}));

    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(400);
  });

  it('returns 400 when splits do not total 100%', async () => {
    const result = await validateCreateSplitsBody(
      makeRequest({
        splits: [
          { address: CALLER, percentAllocation: 60 },
          { address: RECIPIENT, percentAllocation: 30 },
        ],
      })
    );

    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(400);
  });

  it('returns validated data with artist when splits are valid', async () => {
    const result = await validateCreateSplitsBody(makeRequest(validBody));

    expect(result).not.toBeInstanceOf(NextResponse);
    expect((result as any).artist.primaryWallet).toBe(CALLER);
    expect((result as any).splits).toEqual(validBody.splits);
  });
});
