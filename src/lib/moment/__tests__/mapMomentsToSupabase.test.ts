import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/collection/getCollectionIdMap', () => ({
  getCollectionIdMap: vi.fn(),
}));

import { mapMomentsToSupabase } from '../mapMomentsToSupabase';
import { getCollectionIdMap } from '@/lib/collection/getCollectionIdMap';

const mockGetCollectionIdMap = vi.mocked(getCollectionIdMap);

const inProcessMoment = {
  id: '1',
  collection: '0xCOL',
  token_id: '5',
  uri: 'ipfs://uri',
  max_supply: '100',
  chain_id: 8453,
  created_at: 1000,
  updated_at: 2000,
  transaction_hash: '0xtx',
};

const soundMoment = {
  id: '2',
  collection: '0xCOL',
  tier: 3,
  uri: 'ipfs://uri',
  chain_id: 8453,
  created_at: 1000,
  updated_at: 2000,
  transaction_hash: '0xtx',
};

describe('mapMomentsToSupabase', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns empty array for empty input', async () => {
    mockGetCollectionIdMap.mockResolvedValue(new Map());
    expect(await mapMomentsToSupabase([])).toEqual([]);
  });

  it('maps InProcess_Moments_t correctly', async () => {
    mockGetCollectionIdMap.mockResolvedValue(
      new Map([['0xcol:8453', 'col-uuid']])
    );
    const result = await mapMomentsToSupabase([inProcessMoment]);
    expect(result[0]).toMatchObject({
      collection: 'col-uuid',
      token_id: 5,
      uri: 'ipfs://uri',
      max_supply: 100,
      created_at: new Date(1000 * 1000).toISOString(),
      updated_at: new Date(2000 * 1000).toISOString(),
    });
  });

  it('uses tier + 1 as token_id for Sound_Moments_t', async () => {
    mockGetCollectionIdMap.mockResolvedValue(
      new Map([['0xcol:8453', 'col-uuid']])
    );
    const result = await mapMomentsToSupabase([soundMoment as any]);
    expect(result[0].token_id).toBe(4); // tier=3, so 3+1=4
  });

  it('skips moments whose collection is not found', async () => {
    mockGetCollectionIdMap.mockResolvedValue(new Map());
    expect(await mapMomentsToSupabase([inProcessMoment])).toEqual([]);
  });
});
