import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';

vi.mock('@/authMiddleware', () => ({ authMiddleware: vi.fn() }));

import { authMiddleware } from '@/authMiddleware';
import validateCatalogCollect from '@/lib/catalog/validateCatalogCollect';

const ARTIST = '0xaf1452d289e22fbd0dea9d5097353c72a90fac33';
const COLLECTION = '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913';

const makeRequest = (body: unknown) =>
  new NextRequest('http://localhost/api/catalog/collect', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });

const validBody = {
  moment: { tokenId: '1', collectionAddress: COLLECTION },
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(authMiddleware).mockResolvedValue({ artistAddress: ARTIST } as any);
});

describe('validateCatalogCollect', () => {
  it('returns validated data with artistAddress on valid input', async () => {
    const result = await validateCatalogCollect(makeRequest(validBody));

    expect(result).not.toBeInstanceOf(NextResponse);
    expect((result as any).artistAddress).toBe(ARTIST);
    expect((result as any).moment.tokenId).toBe('1');
    expect((result as any).moment.collectionAddress).toBe(COLLECTION);
  });

  it('defaults amount to 1 when not provided', async () => {
    const result = await validateCatalogCollect(makeRequest(validBody));

    expect((result as any).amount).toBe(1);
  });

  it('includes provided amount', async () => {
    const result = await validateCatalogCollect(
      makeRequest({ ...validBody, amount: 5 })
    );

    expect((result as any).amount).toBe(5);
  });

  it('includes optional recipient, ref0, ref1 when provided', async () => {
    const ref = '0x749b7b7a6944d72266be9500fc8c221b6a7554ce';
    const result = await validateCatalogCollect(
      makeRequest({ ...validBody, recipient: ref, ref0: ref, ref1: ref })
    );

    expect((result as any).recipient).toBe(ref);
    expect((result as any).ref0).toBe(ref);
    expect((result as any).ref1).toBe(ref);
  });

  it('returns auth error when auth fails', async () => {
    vi.mocked(authMiddleware).mockResolvedValue(
      NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    );

    const result = await validateCatalogCollect(makeRequest(validBody));

    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(401);
  });

  it('returns 400 when moment is missing', async () => {
    const result = await validateCatalogCollect(makeRequest({}));

    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(400);
  });

  it('returns 400 when collectionAddress is invalid', async () => {
    const result = await validateCatalogCollect(
      makeRequest({
        moment: { tokenId: '1', collectionAddress: 'not-an-address' },
      })
    );

    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(400);
  });

  it('returns 400 when amount is 0', async () => {
    const result = await validateCatalogCollect(
      makeRequest({ ...validBody, amount: 0 })
    );

    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(400);
  });
});
