import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getAddress, type Address } from 'viem';
import getCollectionAddress from '@/lib/telegram/chat/collection/getCollectionAddress';
import { CHAIN_ID } from '@/lib/consts';

vi.mock('../getSelectedCollectionAddress', () => ({ default: vi.fn() }));
vi.mock('@/lib/collection/ensureProcessCollection', () => ({
  default: vi.fn(),
}));

import getSelectedCollectionAddress from '@/lib/telegram/chat/collection/getSelectedCollectionAddress';
import ensureProcessCollection from '@/lib/collection/ensureProcessCollection';

const ARTIST_ADDRESS = '0x0000000000000000000000000000000000000123' as Address;
const PROCESS_COLLECTION =
  '0x0000000000000000000000000000000000000abc' as Address;
const SELECTED_COLLECTION =
  '0x0000000000000000000000000000000000000def' as Address;

const makeThread = () => ({ channelId: 'telegram:chat-1' });

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(getSelectedCollectionAddress).mockResolvedValue(null);
  vi.mocked(ensureProcessCollection).mockResolvedValue({
    address: PROCESS_COLLECTION,
  } as never);
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
    expect(ensureProcessCollection).not.toHaveBeenCalled();
  });

  it('ensures and falls back to the Process collection when none is selected', async () => {
    const result = await getCollectionAddress(
      makeThread() as never,
      ARTIST_ADDRESS
    );

    expect(ensureProcessCollection).toHaveBeenCalledWith(
      ARTIST_ADDRESS,
      CHAIN_ID
    );
    expect(result).toEqual({
      collectionAddress: getAddress(PROCESS_COLLECTION),
      explicitSelection: false,
    });
  });

  it('throws when ensureProcessCollection fails', async () => {
    vi.mocked(ensureProcessCollection).mockRejectedValue({
      message: 'create failed',
    });

    await expect(
      getCollectionAddress(makeThread() as never, ARTIST_ADDRESS)
    ).rejects.toEqual({ message: 'create failed' });
  });
});
