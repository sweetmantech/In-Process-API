import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextResponse } from 'next/server';

vi.mock('@/lib/collection/createCollection', () => ({
  createCollection: vi.fn(),
}));

import { createCollection } from '@/lib/collection/createCollection';
import createCollectionHandler from '@/lib/collection/createCollectionHandler';

const ACCOUNT = '0xaf1452d289e22fbd0dea9d5097353c72a90fac33' as `0x${string}`;
const CONTRACT = '0xcccccccccccccccccccccccccccccccccccccc01' as `0x${string}`;
const TX_HASH = '0xdeadbeef' as `0x${string}`;

const validInput = {
  account: ACCOUNT,
  uri: 'ar://some-hash',
  name: 'My Collection',
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(createCollection).mockResolvedValue({
    contractAddress: CONTRACT,
    hash: TX_HASH,
    chainId: 8453,
  });
});

describe('createCollectionHandler', () => {
  it('returns a NextResponse', async () => {
    const res = await createCollectionHandler(validInput);

    expect(res).toBeInstanceOf(NextResponse);
  });

  it('returns contract address, hash, and chainId on success', async () => {
    const res = await createCollectionHandler(validInput);
    const body = await res.json();

    expect(body.contractAddress).toBe(CONTRACT);
    expect(body.hash).toBe(TX_HASH);
    expect(body.chainId).toBe(8453);
  });

  it('calls createCollection with the provided input', async () => {
    await createCollectionHandler(validInput);

    expect(createCollection).toHaveBeenCalledWith(validInput);
  });

  it('throws when createCollection fails', async () => {
    vi.mocked(createCollection).mockRejectedValue(new Error('chain error'));

    await expect(createCollectionHandler(validInput)).rejects.toThrow('chain error');
  });
});
