import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextResponse } from 'next/server';

vi.mock('@/lib/collection/ensureProcessCollection', () => ({
  default: vi.fn(),
}));

import ensureProcessCollection from '@/lib/collection/ensureProcessCollection';
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

const collectionItem = {
  id: 'collection-1',
  address: CONTRACT.toLowerCase(),
  name: PROCESS_COLLECTION_NAME,
  chain_id: 8453,
  created_at: '2026-01-01T00:00:00.000Z',
  uri: PROCESS_COLLECTION_URI,
  protocol: 'in_process',
  creator: ACCOUNT.toLowerCase(),
  creator_username: null,
  admins: [],
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(ensureProcessCollection).mockResolvedValue(collectionItem);
});

describe('createDefaultCollectionHandler', () => {
  it('returns the ensured Process collection as JSON', async () => {
    const result = await createDefaultCollectionHandler(input);

    expect(ensureProcessCollection).toHaveBeenCalledWith(ACCOUNT, 8453);
    expect(result).toBeInstanceOf(NextResponse);
    expect(result.status).toBe(200);
    await expect(result.json()).resolves.toEqual(collectionItem);
  });
});
