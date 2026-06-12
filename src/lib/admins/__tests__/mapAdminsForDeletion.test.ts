import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/collection/getCollectionInfoMap', () => ({
  getCollectionInfoMap: vi.fn(),
}));

import { mapAdminsForDeletion } from '../mapAdminsForDeletion';
import { getCollectionInfoMap } from '@/lib/collection/getCollectionInfoMap';

const mockGetCollectionIdMap = vi.mocked(getCollectionInfoMap);

const admin = {
  id: '1',
  admin: '0xADMIN',
  collection: '0xCOL1',
  token_id: '5',
  chain_id: 8453,
  permission: 0,
  updated_at: 1000,
};

describe('mapAdminsForDeletion', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns empty array for empty input', async () => {
    mockGetCollectionIdMap.mockResolvedValue(new Map());
    const result = await mapAdminsForDeletion([]);
    expect(result).toEqual([]);
  });

  it('maps admin to delete criteria with lowercase address', async () => {
    mockGetCollectionIdMap.mockResolvedValue(
      new Map([
        ['0xcol1:8453', { id: 'collection-uuid', creator: '0xcreator' }],
      ])
    );
    const result = await mapAdminsForDeletion([admin]);
    expect(result).toEqual([
      {
        collection: 'collection-uuid',
        token_id: 5,
        artist_address: '0xadmin',
      },
    ]);
  });

  it('skips admins whose collection is not found in the map', async () => {
    mockGetCollectionIdMap.mockResolvedValue(new Map());
    const result = await mapAdminsForDeletion([admin]);
    expect(result).toEqual([]);
  });

  it('passes correct collection pairs to getCollectionInfoMap', async () => {
    mockGetCollectionIdMap.mockResolvedValue(new Map());
    await mapAdminsForDeletion([admin]);
    expect(mockGetCollectionIdMap).toHaveBeenCalledWith([['0xCOL1', 8453]]);
  });
});
