import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';

vi.mock('@/authMiddleware', () => ({
  authMiddleware: vi.fn(),
}));

vi.mock('@/lib/supabase/in_process_collections/selectCollections', () => ({
  default: vi.fn(),
}));

vi.mock('@/lib/collection/getProcessCollectionItem', () => ({
  default: vi.fn(),
}));

vi.mock('@/lib/consts', () => ({
  CHAIN_ID: 8453,
  PROCESS_COLLECTION_URI: 'ar://FrDLosTVZP54g8xvLkGG0aWDGrKV46dDAz5umTJkiyA',
  PROCESS_COLLECTION_NAME: 'Process',
}));

import { authMiddleware } from '@/authMiddleware';
import { PROCESS_COLLECTION_NAME, PROCESS_COLLECTION_URI } from '@/lib/consts';
import selectCollections from '@/lib/supabase/in_process_collections/selectCollections';
import getProcessCollectionItem from '@/lib/collection/getProcessCollectionItem';
import validateCreateDefaultCollection from '@/lib/collection/validateCreateDefaultCollection';
import { AuthMethod } from '@/types/auth';

const ACCOUNT = '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' as `0x${string}`;
const CONTRACT = '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb';

const collectionItem = {
  id: 'collection-1',
  address: CONTRACT,
  name: 'Process',
  chain_id: 8453,
  created_at: '2026-01-01T00:00:00.000Z',
  uri: PROCESS_COLLECTION_URI,
  protocol: 'in_process',
  creator: ACCOUNT,
  creator_username: null,
  admins: [],
};

const makeRequest = () =>
  new NextRequest('http://localhost/api/collections/default', {
    method: 'GET',
  });

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(selectCollections).mockResolvedValue([]);
  vi.mocked(getProcessCollectionItem).mockResolvedValue(collectionItem);
});

describe('validateCreateDefaultCollection', () => {
  it('returns createCollection input with auth artist as admin', async () => {
    vi.mocked(authMiddleware).mockResolvedValue({
      primaryWallet: ACCOUNT,
      wallets: [],
      artistId: 'artist-1',
      authMethod: AuthMethod.Privy,
    });

    const result = await validateCreateDefaultCollection(makeRequest());

    expect(selectCollections).toHaveBeenCalledWith({
      artist: ACCOUNT,
      uri: PROCESS_COLLECTION_URI,
      chainId: 8453,
      limit: 1,
    });
    expect(result).not.toBeInstanceOf(NextResponse);
    expect(result).toEqual({
      account: ACCOUNT,
      collection: {
        uri: PROCESS_COLLECTION_URI,
        name: PROCESS_COLLECTION_NAME,
      },
      chainId: 8453,
    });
  });

  it('returns the existing collection item when already created', async () => {
    vi.mocked(authMiddleware).mockResolvedValue({
      primaryWallet: ACCOUNT,
      wallets: [],
      artistId: 'artist-1',
      authMethod: AuthMethod.Privy,
    });
    vi.mocked(selectCollections).mockResolvedValue([
      {
        id: 'collection-1',
        address: CONTRACT,
      } as never,
    ]);

    const result = await validateCreateDefaultCollection(makeRequest());

    expect(getProcessCollectionItem).toHaveBeenCalledWith({
      address: CONTRACT,
      chainId: 8453,
    });
    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(200);
    await expect((result as NextResponse).json()).resolves.toEqual(
      collectionItem
    );
  });

  it('returns auth error response when unauthorized', async () => {
    const unauthorized = NextResponse.json(
      { message: 'Unauthorized' },
      { status: 401 }
    );
    vi.mocked(authMiddleware).mockResolvedValue(unauthorized);

    const result = await validateCreateDefaultCollection(makeRequest());

    expect(result).toBe(unauthorized);
  });
});
