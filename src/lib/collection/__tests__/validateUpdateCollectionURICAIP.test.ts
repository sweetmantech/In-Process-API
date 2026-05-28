import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';

vi.mock('@/authMiddleware', () => ({ authMiddleware: vi.fn() }));

import { authMiddleware } from '@/authMiddleware';
import validateUpdateCollectionURICAIP from '@/lib/collection/validateUpdateCollectionURICAIP';

const ARTIST = '0xaf1452d289e22fbd0dea9d5097353c72a90fac33';
const COLLECTION = '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913';
const NEW_URI = 'ar://some-arweave-hash';

const PARAMS = { network: 'eip155:8453', contract: `erc1155:${COLLECTION}` };

const makeRequest = (body: unknown) =>
  new NextRequest(
    `http://localhost/api/collections/eip155:8453/erc1155:${COLLECTION}`,
    {
      method: 'PATCH',
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json' },
    }
  );

const validBody = {
  newUri: NEW_URI,
  newCollectionName: 'My Collection',
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(authMiddleware).mockResolvedValue({
    primaryWallet: ARTIST,
    artistId: 'artist-uuid',
    wallets: [ARTIST],
    authMethod: 'privy',
  } as any);
});

describe('validateUpdateCollectionURICAIP', () => {
  it('returns validated data on valid input', async () => {
    const result = await validateUpdateCollectionURICAIP(
      makeRequest(validBody),
      PARAMS
    );

    expect(result).not.toBeInstanceOf(NextResponse);
    expect((result as any).artist.primaryWallet).toBe(ARTIST);
    expect((result as any).collection.chainId).toBe(8453);
    expect((result as any).newUri).toBe(NEW_URI);
    expect((result as any).newCollectionName).toBe('My Collection');
  });

  it('returns 401 when auth fails', async () => {
    vi.mocked(authMiddleware).mockResolvedValue(
      NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    );

    const result = await validateUpdateCollectionURICAIP(
      makeRequest(validBody),
      PARAMS
    );

    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(401);
  });

  it('returns 400 when network namespace is not eip155', async () => {
    const result = await validateUpdateCollectionURICAIP(
      makeRequest(validBody),
      {
        network: 'cosmos:1',
        contract: `erc1155:${COLLECTION}`,
      }
    );

    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(400);
  });

  it('returns 400 when asset namespace is not erc1155', async () => {
    const result = await validateUpdateCollectionURICAIP(
      makeRequest(validBody),
      {
        network: 'eip155:8453',
        contract: `erc20:${COLLECTION}`,
      }
    );

    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(400);
  });

  it('returns 400 when newUri is missing', async () => {
    const result = await validateUpdateCollectionURICAIP(
      makeRequest({ newCollectionName: 'My Collection' }),
      PARAMS
    );

    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(400);
  });

  it('returns 400 when newCollectionName is missing', async () => {
    const result = await validateUpdateCollectionURICAIP(
      makeRequest({ newUri: NEW_URI }),
      PARAMS
    );

    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(400);
  });
});
