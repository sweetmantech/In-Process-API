import { describe, it, expect } from 'vitest';
import { getMomentUris } from '../getMomentUris';
import type {
  InProcess_Moments_t,
  Sound_Moments_t,
  ZoraMedia_Moments_t,
} from '@/types/envio';

describe('getMomentUris', () => {
  it('returns empty map for non-Zora moments', () => {
    const moment: InProcess_Moments_t = {
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
    expect(getMomentUris([moment]).size).toBe(0);
  });

  it('extracts contentUri for ZoraMedia moments', () => {
    const moment: ZoraMedia_Moments_t = {
      id: '2',
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
    const map = getMomentUris([moment]);
    expect(map.get('0xCOL:7')).toEqual({
      contentUri: 'ipfs://content',
    });
  });

  it('omits entry when metadata_uri is absent', () => {
    const moment: ZoraMedia_Moments_t = {
      id: '3',
      collection: '0xCOL',
      token_id: '8',
      owner: '0xOWNER',
      uri: 'ipfs://content',
      metadata_uri: undefined,
      chain_id: 8453,
      created_at: 1000,
      updated_at: 2000,
      transaction_hash: '0xtx',
    };
    expect(getMomentUris([moment]).size).toBe(0);
  });

  it('uses tier + 1 as token key for Sound moments (no entry added)', () => {
    const moment: Sound_Moments_t = {
      id: '4',
      collection: '0xCOL',
      tier: 2,
      uri: 'ipfs://uri',
      chain_id: 8453,
      created_at: 1000,
      updated_at: 2000,
      transaction_hash: '0xtx',
    };
    expect(getMomentUris([moment]).size).toBe(0);
  });
});
