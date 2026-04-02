import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';

vi.mock('@/authMiddleware', () => ({ authMiddleware: vi.fn() }));

import { authMiddleware } from '@/authMiddleware';
import validateUpdateCollectionURI from '@/lib/collection/validateUpdateCollectionURI';

const ARTIST = '0xaf1452d289e22fbd0dea9d5097353c72a90fac33';
const COLLECTION = '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913';
const NEW_URI = 'ar://some-arweave-hash';

const makeRequest = (body: unknown) =>
  new NextRequest('http://localhost/api/collection/uri', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });

const validBody = {
  collection: { address: COLLECTION, chainId: 8453 },
  newUri: NEW_URI,
  newCollectionName: 'My Collection',
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(authMiddleware).mockResolvedValue({ artistAddress: ARTIST } as any);
});

describe('validateUpdateCollectionURI', () => {
  it('returns validated data with artistAddress on valid input', async () => {
    const result = await validateUpdateCollectionURI(makeRequest(validBody));

    expect(result).not.toBeInstanceOf(NextResponse);
    expect((result as any).artistAddress).toBe(ARTIST);
    expect((result as any).collection.address).toBe(COLLECTION);
    expect((result as any).newUri).toBe(NEW_URI);
    expect((result as any).newCollectionName).toBe('My Collection');
  });

  it('returns auth error when auth fails', async () => {
    vi.mocked(authMiddleware).mockResolvedValue(
      NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    );

    const result = await validateUpdateCollectionURI(makeRequest(validBody));

    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(401);
  });

  it('returns 400 when collection is missing', async () => {
    const result = await validateUpdateCollectionURI(
      makeRequest({ newUri: NEW_URI, newCollectionName: 'My Collection' })
    );

    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(400);
  });

  it('returns 400 when collection address is invalid', async () => {
    const result = await validateUpdateCollectionURI(
      makeRequest({
        ...validBody,
        collection: { address: 'not-an-address', chainId: 8453 },
      })
    );

    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(400);
  });

  it('returns 400 when newUri is missing', async () => {
    const result = await validateUpdateCollectionURI(
      makeRequest({
        collection: validBody.collection,
        newCollectionName: 'My Collection',
      })
    );

    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(400);
  });

  it('returns 400 when newCollectionName is missing', async () => {
    const result = await validateUpdateCollectionURI(
      makeRequest({ collection: validBody.collection, newUri: NEW_URI })
    );

    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(400);
  });
});
