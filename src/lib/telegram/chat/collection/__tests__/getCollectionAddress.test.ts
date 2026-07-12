import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getAddress, type Address } from 'viem';
import getCollectionAddress from '@/lib/telegram/chat/collection/getCollectionAddress';

vi.mock('../getSelectedCollectionAddress', () => ({ default: vi.fn() }));
vi.mock('@/lib/supabase/in_process_collections/selectCollections', () => ({
  default: vi.fn(),
}));

import getSelectedCollectionAddress from '@/lib/telegram/chat/collection/getSelectedCollectionAddress';
import selectCollections from '@/lib/supabase/in_process_collections/selectCollections';

const ARTIST_ADDRESS = '0x0000000000000000000000000000000000000123' as Address;
const DEFAULT_COLLECTION =
  '0x0000000000000000000000000000000000000abc' as Address;
const SELECTED_COLLECTION =
  '0x0000000000000000000000000000000000000def' as Address;

const makeThread = () => ({ channelId: 'telegram:chat-1' });

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(getSelectedCollectionAddress).mockResolvedValue(null);
  vi.mocked(selectCollections).mockResolvedValue([
    { address: DEFAULT_COLLECTION, name: 'Default' } as never,
  ]);
});

describe('getCollectionAddress', () => {
  it('returns an explicitly selected collection', async () => {
    vi.mocked(getSelectedCollectionAddress).mockResolvedValue(
      getAddress(SELECTED_COLLECTION)
    );

    const result = await getCollectionAddress(
      makeThread() as never,
      ARTIST_ADDRESS
    );

    expect(result).toEqual({
      collectionAddress: getAddress(SELECTED_COLLECTION),
      explicitSelection: true,
    });
    expect(selectCollections).not.toHaveBeenCalled();
  });

  it('falls back to the first collection when none is selected', async () => {
    const result = await getCollectionAddress(
      makeThread() as never,
      ARTIST_ADDRESS
    );

    expect(selectCollections).toHaveBeenCalledWith({
      artist: ARTIST_ADDRESS,
      chainId: expect.any(Number),
      limit: 1,
    });
    expect(result).toEqual({
      collectionAddress: getAddress(DEFAULT_COLLECTION),
      explicitSelection: false,
    });
  });

  it('returns null when the artist has no collections', async () => {
    vi.mocked(selectCollections).mockResolvedValue([]);

    const result = await getCollectionAddress(
      makeThread() as never,
      ARTIST_ADDRESS
    );

    expect(result).toEqual({
      collectionAddress: null,
      explicitSelection: false,
    });
  });

  it('throws when selectCollections fails', async () => {
    vi.mocked(selectCollections).mockRejectedValue({ message: 'db error' });

    await expect(
      getCollectionAddress(makeThread() as never, ARTIST_ADDRESS)
    ).rejects.toEqual({ message: 'db error' });
  });
});
