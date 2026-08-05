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

vi.mock('@/lib/collection/createCollectionHandler', () => ({
  default: vi.fn(),
}));

vi.mock('@/lib/consts', () => ({
  PROCESS_COLLECTION_URI: 'ar://FrDLosTVZP54g8xvLkGG0aWDGrKV46dDAz5umTJkiyA',
}));

import { withProcessCollectionCreateLock } from '@/lib/collection/withProcessCollectionCreateLock';
import selectCollections from '@/lib/supabase/in_process_collections/selectCollections';
import createCollectionHandler from '@/lib/collection/createCollectionHandler';
import createDefaultCollectionHandler from '@/lib/collection/createDefaultCollectionHandler';
import { PROCESS_COLLECTION_URI } from '@/lib/consts';

const ACCOUNT = '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' as `0x${string}`;

const input = {
  account: ACCOUNT,
  collection: {
    uri: PROCESS_COLLECTION_URI,
    name: 'Process',
  },
  chainId: 8453,
};

const createResponse = NextResponse.json({
  contractAddress: '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
  hash: '0xdeadbeef',
  chainId: 8453,
});

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(withProcessCollectionCreateLock).mockImplementation(
    (_artist, _chainId, fn) => fn()
  );
  vi.mocked(selectCollections).mockResolvedValue([]);
  vi.mocked(createCollectionHandler).mockResolvedValue(createResponse);
});

describe('createDefaultCollectionHandler', () => {
  it('creates under the process-collection lock when none exists', async () => {
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
    expect(createCollectionHandler).toHaveBeenCalledWith(input);
    expect(result).toBe(createResponse);
  });

  it('returns 200 without creating when another request already created it', async () => {
    vi.mocked(selectCollections).mockResolvedValue([
      {
        id: 'collection-1',
        address: '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
      } as never,
    ]);

    const result = await createDefaultCollectionHandler(input);

    expect(createCollectionHandler).not.toHaveBeenCalled();
    expect(result).toBeInstanceOf(NextResponse);
    expect(result.status).toBe(200);
    await expect(result.json()).resolves.toEqual({
      message: 'Process collection already created',
    });
  });
});
