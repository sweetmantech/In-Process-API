import { describe, it, expect, vi, beforeEach } from 'vitest';

import { mapMomentsToSupabase } from '../mapMomentsToSupabase';
import type { CollectionInfo } from '@/lib/collection/getCollectionInfoMap';

const COL_KEY = '0xcol:8453';
const colInfo: CollectionInfo = { id: 'col-uuid', creator: '0xcreator' };
const infoMap = new Map([[COL_KEY, colInfo]]);

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

const zoraMoment = {
  id: '3',
  collection: '0xCOL',
  token_id: '7',
  owner: '0xOWNER',
  uri: 'ipfs://content',
  metadata_uri: 'ipfs://metadata',
  chain_id: 8453,
  created_at: 1000,
  updated_at: 2000,
  transaction_hash: '0xtx',
};

describe('mapMomentsToSupabase', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns empty array for empty input', () => {
    expect(mapMomentsToSupabase([], new Map())).toEqual([]);
  });

  it('maps InProcess_Moments_t correctly', () => {
    const result = mapMomentsToSupabase([inProcessMoment], infoMap);
    expect(result[0]).toMatchObject({
      collection: 'col-uuid',
      token_id: 5,
      uri: 'ipfs://uri',
      max_supply: 100,
      created_at: new Date(1000 * 1000).toISOString(),
      updated_at: new Date(2000 * 1000).toISOString(),
    });
  });

  it('uses tier + 1 as token_id for Sound_Moments_t', () => {
    const result = mapMomentsToSupabase([soundMoment as any], infoMap);
    expect(result[0].token_id).toBe(4); // tier=3, so 3+1=4
  });

  it('uses metadata_uri as stored uri for ZoraMedia_Moments_t', () => {
    const result = mapMomentsToSupabase([zoraMoment as any], infoMap);
    expect(result[0].uri).toBe('ipfs://metadata');
    expect(result[0].token_id).toBe(7);
  });

  it('falls back to uri when metadata_uri is absent for ZoraMedia_Moments_t', () => {
    const noMetadataUri = { ...zoraMoment, metadata_uri: undefined };
    const result = mapMomentsToSupabase([noMetadataUri as any], infoMap);
    expect(result[0].uri).toBe('ipfs://content');
  });

  it('skips moments whose collection is not found', () => {
    expect(mapMomentsToSupabase([inProcessMoment], new Map())).toEqual([]);
  });
});
