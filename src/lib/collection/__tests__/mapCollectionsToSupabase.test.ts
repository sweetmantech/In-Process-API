import { describe, it, expect } from 'vitest';
import { mapCollectionsToSupabase } from '../mapCollectionsToSupabase';
import type {
  InProcess_Collections_t,
  Catalog_Collections_t,
  Sound_Editions_t,
} from '@/types/envio';

const inProcessCollection: InProcess_Collections_t = {
  id: '1',
  address: '0xADDR',
  name: 'My Collection',
  uri: 'ipfs://uri',
  default_admin: '0xCREATOR',
  chain_id: 8453,
  created_at: 1000,
  updated_at: 2000,
  transaction_hash: '0xtx',
};

const catalogCollection: Catalog_Collections_t = {
  id: '2',
  address: '0xADDR2',
  name: 'Catalog Col',
  uri: 'ar://uri',
  creator: '0xCATCREATOR',
  chain_id: 8453,
  created_at: 1000,
  updated_at: 2000,
  transaction_hash: '0xtx',
};

const soundEdition: Sound_Editions_t = {
  id: '3',
  address: '0xADDR3',
  name: 'Sound Edition',
  uri: 'https://uri',
  owner: '0xOWNER',
  chain_id: 8453,
  created_at: 1000,
  updated_at: 2000,
  transaction_hash: '0xtx',
};

describe('mapCollectionsToSupabase', () => {
  it('maps InProcess_Collections_t with protocol=in_process and creator=default_admin', () => {
    const result = mapCollectionsToSupabase([inProcessCollection]);
    expect(result[0].protocol).toBe('in_process');
    expect(result[0].creator).toBe('0xCREATOR');
  });

  it('maps Catalog_Collections_t with protocol=catalog and creator=creator field', () => {
    const result = mapCollectionsToSupabase([catalogCollection]);
    expect(result[0].protocol).toBe('catalog');
    expect(result[0].creator).toBe('0xCATCREATOR');
  });

  it('maps Sound_Editions_t with protocol=sound.xyz and creator=owner', () => {
    const result = mapCollectionsToSupabase([soundEdition]);
    expect(result[0].protocol).toBe('sound.xyz');
    expect(result[0].creator).toBe('0xOWNER');
  });

  it('converts timestamps to ISO strings', () => {
    const result = mapCollectionsToSupabase([inProcessCollection]);
    expect(result[0].created_at).toBe(new Date(1000 * 1000).toISOString());
    expect(result[0].updated_at).toBe(new Date(2000 * 1000).toISOString());
  });

  it('maps address, name, uri and chain_id', () => {
    const result = mapCollectionsToSupabase([inProcessCollection]);
    expect(result[0].address).toBe('0xADDR');
    expect(result[0].name).toBe('My Collection');
    expect(result[0].uri).toBe('ipfs://uri');
    expect(result[0].chain_id).toBe(8453);
  });

  it('returns empty array for empty input', () => {
    expect(mapCollectionsToSupabase([])).toEqual([]);
  });
});
