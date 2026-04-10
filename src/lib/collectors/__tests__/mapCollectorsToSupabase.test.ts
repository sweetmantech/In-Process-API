import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/moment/getMomentIdMap', () => ({ getMomentIdMap: vi.fn() }));

import { mapCollectorsToSupabase } from '../mapCollectorsToSupabase';
import { getMomentIdMap } from '@/lib/moment/getMomentIdMap';

const mockGetMomentIdMap = vi.mocked(getMomentIdMap);

const collector = {
  id: '1',
  collection: '0xCOL',
  token_id: '2',
  collector: '0xCOLLECTOR',
  amount: '3',
  chain_id: 8453,
  transaction_hash: '0xTX',
  collected_at: 1700000000,
};

describe('mapCollectorsToSupabase', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns empty array for empty input', async () => {
    mockGetMomentIdMap.mockResolvedValue(new Map());
    expect(await mapCollectorsToSupabase([])).toEqual([]);
  });

  it('maps collector to supabase insert shape', async () => {
    mockGetMomentIdMap.mockResolvedValue(
      new Map([['0xcol:8453:2', 'moment-uuid']])
    );
    const result = await mapCollectorsToSupabase([collector]);
    expect(result).toEqual([
      {
        moment: 'moment-uuid',
        collector: '0xcollector',
        amount: 3,
        transaction_hash: '0xtx',
        collected_at: new Date(1700000000 * 1000).toISOString(),
      },
    ]);
  });

  it('skips collectors whose moment is not found', async () => {
    mockGetMomentIdMap.mockResolvedValue(new Map());
    expect(await mapCollectorsToSupabase([collector])).toEqual([]);
  });

  it('lowercases collector address and transaction_hash', async () => {
    mockGetMomentIdMap.mockResolvedValue(
      new Map([['0xcol:8453:2', 'moment-uuid']])
    );
    const result = await mapCollectorsToSupabase([
      { ...collector, collector: '0xAbCdEf', transaction_hash: '0xABCDEF' },
    ]);
    expect(result[0].collector).toBe('0xabcdef');
    expect(result[0].transaction_hash).toBe('0xabcdef');
  });
});
