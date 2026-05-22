import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextResponse } from 'next/server';

vi.mock('@/lib/collection/createCollections', () => ({
  createCollections: vi.fn(),
}));

import { createCollections } from '@/lib/collection/createCollections';
import createCollectionsHandler from '@/lib/collection/createCollectionsHandler';

const ACCOUNT = '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' as `0x${string}`;

const baseInput = {
  account: ACCOUNT,
  collections: [{ uri: 'ipfs://test', name: 'Test Collection' }],
};

const mockResults = [
  {
    contractAddress:
      '0xaaaa000000000000000000000000000000000001' as `0x${string}`,
    hash: '0xdeadbeef' as `0x${string}`,
    chainId: 8453,
  },
];

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(createCollections).mockResolvedValue(mockResults);
});

describe('createCollectionsHandler', () => {
  it('returns a NextResponse', async () => {
    const res = await createCollectionsHandler(baseInput);
    expect(res).toBeInstanceOf(NextResponse);
  });

  it('returns the results from createCollections as JSON', async () => {
    const res = await createCollectionsHandler(baseInput);
    const body = await res.json();
    expect(body).toEqual(mockResults);
  });

  it('calls createCollections with the full input', async () => {
    await createCollectionsHandler(baseInput);
    expect(createCollections).toHaveBeenCalledWith(baseInput);
  });

  it('propagates errors thrown by createCollections', async () => {
    vi.mocked(createCollections).mockRejectedValue(new Error('chain error'));
    await expect(createCollectionsHandler(baseInput)).rejects.toThrow(
      'chain error'
    );
  });
});
