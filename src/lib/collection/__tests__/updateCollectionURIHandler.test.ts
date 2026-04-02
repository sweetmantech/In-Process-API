import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextResponse } from 'next/server';

vi.mock('@/lib/collection/updateCollectionURI', () => ({
  updateCollectionURI: vi.fn(),
}));

import { updateCollectionURI } from '@/lib/collection/updateCollectionURI';
import updateCollectionURIHandler from '@/lib/collection/updateCollectionURIHandler';

const ARTIST_ADDRESS =
  '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb01' as `0x${string}`;
const COLLECTION_ADDRESS =
  '0xcccccccccccccccccccccccccccccccccccccc01' as `0x${string}`;
const TX_HASH = '0xdeadbeef';
const NEW_URI = 'ar://some-arweave-hash';

const baseInput = {
  artistAddress: ARTIST_ADDRESS,
  collection: { address: COLLECTION_ADDRESS, chainId: 8453 },
  newUri: NEW_URI,
  newCollectionName: 'My Collection',
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(updateCollectionURI).mockResolvedValue({
    hash: TX_HASH as `0x${string}`,
    chainId: 8453,
  });
});

describe('updateCollectionURIHandler', () => {
  it('returns hash and chainId on success', async () => {
    const res = await updateCollectionURIHandler(baseInput);
    const body = await res.json();
    expect(body.hash).toBe(TX_HASH);
    expect(body.chainId).toBe(8453);
  });

  it('calls updateCollectionURI with correct args', async () => {
    await updateCollectionURIHandler(baseInput);
    expect(updateCollectionURI).toHaveBeenCalledWith({
      collection: baseInput.collection,
      newUri: NEW_URI,
      newCollectionName: 'My Collection',
      artistAddress: ARTIST_ADDRESS,
    });
  });

  it('returns a NextResponse', async () => {
    const res = await updateCollectionURIHandler(baseInput);
    expect(res).toBeInstanceOf(NextResponse);
  });

  it('throws when updateCollectionURI fails', async () => {
    vi.mocked(updateCollectionURI).mockRejectedValue(
      new Error('update failed')
    );
    await expect(updateCollectionURIHandler(baseInput)).rejects.toThrow(
      'update failed'
    );
  });
});
