import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextResponse } from 'next/server';

vi.mock('@/lib/collection/withProcessCollectionCreateLock', () => ({
  withProcessCollectionCreateLock: vi.fn(
    (_artist: unknown, _chainId: unknown, fn: () => Promise<unknown>) => fn()
  ),
}));

vi.mock('@/lib/supabase/in_process_collections/selectCollections', () => ({
  default: vi.fn(),
}));

vi.mock('@/lib/collection/createCollection', () => ({
  createCollection: vi.fn(),
}));

vi.mock('@/lib/supabase/in_process_collections/upsertCollections', () => ({
  upsertCollections: vi.fn(),
}));

vi.mock('@/lib/wallets/ensureWallets', () => ({
  ensureWallets: vi.fn(),
}));

vi.mock('@/lib/consts', () => ({
  PROCESS_COLLECTION_URI: 'ar://FrDLosTVZP54g8xvLkGG0aWDGrKV46dDAz5umTJkiyA',
  PROCESS_COLLECTION_NAME: 'Process',
}));

import { withProcessCollectionCreateLock } from '@/lib/collection/withProcessCollectionCreateLock';
import selectCollections from '@/lib/supabase/in_process_collections/selectCollections';
import { createCollection } from '@/lib/collection/createCollection';
import { upsertCollections } from '@/lib/supabase/in_process_collections/upsertCollections';
import { ensureWallets } from '@/lib/wallets/ensureWallets';
import createDefaultCollectionHandler from '@/lib/collection/createDefaultCollectionHandler';
import { PROCESS_COLLECTION_NAME, PROCESS_COLLECTION_URI } from '@/lib/consts';

const ACCOUNT = '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' as `0x${string}`;
const CONTRACT = '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb' as `0x${string}`;

const input = {
  account: ACCOUNT,
  collection: {
    uri: PROCESS_COLLECTION_URI,
    name: PROCESS_COLLECTION_NAME,
  },
  chainId: 8453,
};

const createResult = {
  contractAddress: CONTRACT,
  hash: '0xdeadbeef' as `0x${string}`,
  chainId: 8453,
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(withProcessCollectionCreateLock).mockImplementation(
    (_artist, _chainId, fn) => fn()
  );
  vi.mocked(selectCollections).mockResolvedValue([]);
  vi.mocked(createCollection).mockResolvedValue(createResult);
  vi.mocked(upsertCollections).mockResolvedValue([{ id: 'collection-1' }]);
  vi.mocked(ensureWallets).mockResolvedValue(undefined as never);
});

describe('createDefaultCollectionHandler', () => {
  it('creates, persists the collection, then returns under the lock', async () => {
    const result = await createDefaultCollectionHandler(input);

    expect(withProcessCollectionCreateLock).toHaveBeenCalledWith(
      ACCOUNT,
      8453,
      expect.any(Function)
    );
    expect(selectCollections).toHaveBeenCalledWith({
      artist: ACCOUNT,
      uri: PROCESS_COLLECTION_URI,
      chainId: 8453,
      limit: 1,
    });
    expect(createCollection).toHaveBeenCalledWith(input);
    expect(ensureWallets).toHaveBeenCalledWith([ACCOUNT]);
    expect(upsertCollections).toHaveBeenCalledWith([
      expect.objectContaining({
        address: CONTRACT,
        chain_id: 8453,
        creator: ACCOUNT,
        protocol: 'in_process',
        uri: PROCESS_COLLECTION_URI,
        name: PROCESS_COLLECTION_NAME,
      }),
    ]);
    expect(result).toBeInstanceOf(NextResponse);
    await expect(result.json()).resolves.toEqual(createResult);
  });

  it('returns 200 without creating when another request already created it', async () => {
    vi.mocked(selectCollections).mockResolvedValue([
      {
        id: 'collection-1',
        address: CONTRACT,
      } as never,
    ]);

    const result = await createDefaultCollectionHandler(input);

    expect(createCollection).not.toHaveBeenCalled();
    expect(upsertCollections).not.toHaveBeenCalled();
    expect(result).toBeInstanceOf(NextResponse);
    expect(result.status).toBe(200);
    await expect(result.json()).resolves.toEqual({
      message: 'Process collection already created',
    });
  });
});
