import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/moment/getMomentIdMap', () => ({ getMomentIdMap: vi.fn() }));

import { mapAirdropsToSupabase } from '../mapAirdropsToSupabase';
import { getMomentIdMap } from '@/lib/moment/getMomentIdMap';

const mockGetMomentIdMap = vi.mocked(getMomentIdMap);

const airdrop = {
  id: '1',
  recipient: '0xRECIPIENT',
  collection: '0xCOL',
  token_id: '3',
  amount: '5',
  chain_id: 8453,
  updated_at: 1700000000,
};

describe('mapAirdropsToSupabase', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns empty array for empty input', async () => {
    mockGetMomentIdMap.mockResolvedValue(new Map());
    expect(await mapAirdropsToSupabase([])).toEqual([]);
  });

  it('maps airdrop to supabase insert shape', async () => {
    mockGetMomentIdMap.mockResolvedValue(
      new Map([['0xcol:8453:3', 'moment-uuid']])
    );
    const result = await mapAirdropsToSupabase([airdrop]);
    expect(result).toEqual([
      {
        moment: 'moment-uuid',
        recipient: '0xrecipient',
        amount: 5,
        updated_at: new Date(1700000000 * 1000).toISOString(),
      },
    ]);
  });

  it('skips airdrops whose moment is not found', async () => {
    mockGetMomentIdMap.mockResolvedValue(new Map());
    expect(await mapAirdropsToSupabase([airdrop])).toEqual([]);
  });

  it('lowercases recipient', async () => {
    mockGetMomentIdMap.mockResolvedValue(
      new Map([['0xcol:8453:3', 'moment-uuid']])
    );
    const result = await mapAirdropsToSupabase([
      { ...airdrop, recipient: '0xAbCdEf' },
    ]);
    expect(result[0].recipient).toBe('0xabcdef');
  });
});
