import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/moment/getMomentIdMap', () => ({ getMomentIdMap: vi.fn() }));

import { mapPaymentsToSupabase } from '../mapPaymentsToSupabase';
import { getMomentIdMap } from '@/lib/moment/getMomentIdMap';

const mockGetMomentIdMap = vi.mocked(getMomentIdMap);

const deposit = {
  id: '1',
  collection: '0xCOL',
  token_id: '2',
  currency: '0xUSDC',
  recipient: '0xrecipient',
  spender: '0xSPENDER',
  amount: '1.5',
  chain_id: 8453,
  transaction_hash: '0xTX',
  transferred_at: 1700000000,
};

describe('mapPaymentsToSupabase', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns empty array for empty input', async () => {
    mockGetMomentIdMap.mockResolvedValue(new Map());
    expect(await mapPaymentsToSupabase([])).toEqual([]);
  });

  it('maps deposit to supabase insert shape', async () => {
    mockGetMomentIdMap.mockResolvedValue(
      new Map([['0xcol:8453:2', 'moment-uuid']])
    );
    const result = await mapPaymentsToSupabase([deposit]);
    expect(result).toEqual([
      {
        transaction_hash: '0xTX',
        buyer: '0xspender',
        moment: 'moment-uuid',
        amount: 1.5,
        transferred_at: new Date(1700000000 * 1000).toISOString(),
      },
    ]);
  });

  it('skips payments whose moment is not found', async () => {
    mockGetMomentIdMap.mockResolvedValue(new Map());
    expect(await mapPaymentsToSupabase([deposit])).toEqual([]);
  });

  it('skips payments with amount <= 0', async () => {
    mockGetMomentIdMap.mockResolvedValue(
      new Map([['0xcol:8453:2', 'moment-uuid']])
    );
    const result = await mapPaymentsToSupabase([{ ...deposit, amount: '0' }]);
    expect(result).toEqual([]);
  });

  it('skips payments with empty amount string (defaults to 0)', async () => {
    mockGetMomentIdMap.mockResolvedValue(
      new Map([['0xcol:8453:2', 'moment-uuid']])
    );
    const result = await mapPaymentsToSupabase([{ ...deposit, amount: '' }]);
    expect(result).toEqual([]);
  });

  it('lowercases buyer address', async () => {
    mockGetMomentIdMap.mockResolvedValue(
      new Map([['0xcol:8453:2', 'moment-uuid']])
    );
    const result = await mapPaymentsToSupabase([
      { ...deposit, spender: '0xAbCdEf' },
    ]);
    expect(result[0].buyer).toBe('0xabcdef');
  });
});
