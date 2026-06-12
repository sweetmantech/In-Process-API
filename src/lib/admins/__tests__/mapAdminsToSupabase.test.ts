import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/collection/getCollectionInfoMap', () => ({
  getCollectionInfoMap: vi.fn(),
}));

import { mapAdminsToSupabase } from '../mapAdminsToSupabase';
import { getCollectionInfoMap } from '@/lib/collection/getCollectionInfoMap';

const mockGetCollectionIdMap = vi.mocked(getCollectionInfoMap);

const admin = {
  id: '1',
  admin: '0xADMIN',
  collection: '0xCOL1',
  token_id: '5',
  chain_id: 8453,
  permission: 2,
  updated_at: 1700000000,
};

describe('mapAdminsToSupabase', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns empty array for empty input', async () => {
    mockGetCollectionIdMap.mockResolvedValue(new Map());
    const result = await mapAdminsToSupabase([]);
    expect(result).toEqual([]);
  });

  it('maps admin to supabase insert shape', async () => {
    mockGetCollectionIdMap.mockResolvedValue(
      new Map([
        ['0xcol1:8453', { id: 'collection-uuid', creator: '0xcreator' }],
      ])
    );
    const result = await mapAdminsToSupabase([admin]);
    expect(result).toEqual([
      {
        collection: 'collection-uuid',
        token_id: 5,
        artist_address: '0xadmin',
        granted_at: new Date(1700000000 * 1000).toISOString(),
      },
    ]);
  });

  it('skips admins whose collection is not found', async () => {
    mockGetCollectionIdMap.mockResolvedValue(new Map());
    const result = await mapAdminsToSupabase([admin]);
    expect(result).toEqual([]);
  });

  it('lowercases artist_address', async () => {
    mockGetCollectionIdMap.mockResolvedValue(
      new Map([['0xcol1:8453', { id: 'col-id', creator: '0xcreator' }]])
    );
    const result = await mapAdminsToSupabase([{ ...admin, admin: '0xAbCdEf' }]);
    expect(result[0].artist_address).toBe('0xabcdef');
  });
});
