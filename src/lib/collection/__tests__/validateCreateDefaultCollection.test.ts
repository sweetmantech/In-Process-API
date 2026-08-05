import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';

vi.mock('@/authMiddleware', () => ({
  authMiddleware: vi.fn(),
}));

vi.mock('@/lib/supabase/in_process_collections/selectCollections', () => ({
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
import validateCreateDefaultCollection from '@/lib/collection/validateCreateDefaultCollection';
import { AuthMethod } from '@/types/auth';

const ACCOUNT = '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' as `0x${string}`;

const makeRequest = () =>
  new NextRequest('http://localhost/api/collections/default', {
    method: 'POST',
  });

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(selectCollections).mockResolvedValue([]);
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

  it('returns 200 when the artist already has the process collection', async () => {
    vi.mocked(authMiddleware).mockResolvedValue({
      primaryWallet: ACCOUNT,
      wallets: [],
      artistId: 'artist-1',
      authMethod: AuthMethod.Privy,
    });
    vi.mocked(selectCollections).mockResolvedValue([
      {
        id: 'collection-1',
        address: '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
      } as never,
    ]);

    const result = await validateCreateDefaultCollection(makeRequest());

    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(200);
    await expect((result as NextResponse).json()).resolves.toEqual({
      message: 'Process collection already created',
    });
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
