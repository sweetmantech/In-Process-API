import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';

vi.mock('@/authMiddleware', () => ({ authMiddleware: vi.fn() }));

import { authMiddleware } from '@/authMiddleware';
import validateCatalogUpdateCollectionMetadata from '@/lib/catalog/validateCatalogUpdateCollectionMetadata';

const ARTIST = '0xaf1452d289e22fbd0dea9d5097353c72a90fac33';
const COLLECTION = '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913';
const NEW_URI = 'ar://some-arweave-hash';

const makeRequest = (body: unknown) =>
  new NextRequest('http://localhost/api/catalog/metadata/collection', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });

const validBody = {
  collection: { address: COLLECTION, chainId: 8453 },
  newUri: NEW_URI,
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(authMiddleware).mockResolvedValue({ artistAddress: ARTIST } as any);
});

describe('validateCatalogUpdateCollectionMetadata', () => {
  it('returns validated data with artistAddress on valid input', async () => {
    const result = await validateCatalogUpdateCollectionMetadata(
      makeRequest(validBody)
    );

    expect(result).not.toBeInstanceOf(NextResponse);
    expect((result as any).artistAddress).toBe(ARTIST);
    expect((result as any).collection.address).toBe(COLLECTION);
    expect((result as any).newUri).toBe(NEW_URI);
  });

  it('returns auth error when auth fails', async () => {
    vi.mocked(authMiddleware).mockResolvedValue(
      NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    );

    const result = await validateCatalogUpdateCollectionMetadata(
      makeRequest(validBody)
    );

    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(401);
  });

  it('returns 400 when collection is missing', async () => {
    const result = await validateCatalogUpdateCollectionMetadata(
      makeRequest({ newUri: NEW_URI })
    );

    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(400);
  });

  it('returns 400 when collection address is invalid', async () => {
    const result = await validateCatalogUpdateCollectionMetadata(
      makeRequest({
        collection: { address: 'not-an-address', chainId: 8453 },
        newUri: NEW_URI,
      })
    );

    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(400);
  });

  it('returns 400 when newUri is missing', async () => {
    const result = await validateCatalogUpdateCollectionMetadata(
      makeRequest({ collection: { address: COLLECTION, chainId: 8453 } })
    );

    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(400);
  });

  it('returns 400 when newUri is empty string', async () => {
    const result = await validateCatalogUpdateCollectionMetadata(
      makeRequest({ ...validBody, newUri: '' })
    );

    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(400);
  });
});
