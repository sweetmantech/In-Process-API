import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextResponse } from 'next/server';

vi.mock('@/lib/collection/createCollection', () => ({
  createCollection: vi.fn(),
}));

import { createCollection } from '@/lib/collection/createCollection';
import createCollectionHandler from '@/lib/collection/createCollectionHandler';

const ACCOUNT = '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' as `0x${string}`;

const baseInput = {
  account: ACCOUNT,
  collection: { uri: 'ipfs://test', name: 'Test Collection' },
};

const mockResult = {
  contractAddress:
    '0xaaaa000000000000000000000000000000000001' as `0x${string}`,
  hash: '0xdeadbeef' as `0x${string}`,
  chainId: 8453,
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(createCollection).mockResolvedValue(mockResult);
});

describe('createCollectionHandler', () => {
  it('returns a NextResponse', async () => {
    const res = await createCollectionHandler(baseInput);
    expect(res).toBeInstanceOf(NextResponse);
  });

  it('returns the result from createCollection as JSON', async () => {
    const res = await createCollectionHandler(baseInput);
    const body = await res.json();
    expect(body).toEqual(mockResult);
  });

  it('calls createCollection with the full input', async () => {
    await createCollectionHandler(baseInput);
    expect(createCollection).toHaveBeenCalledWith(baseInput);
  });

  it('propagates errors thrown by createCollection', async () => {
    vi.mocked(createCollection).mockRejectedValue(new Error('chain error'));
    await expect(createCollectionHandler(baseInput)).rejects.toThrow(
      'chain error'
    );
  });
});
