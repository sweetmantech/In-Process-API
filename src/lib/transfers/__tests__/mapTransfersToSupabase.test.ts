import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/moment/getMomentIdMap', () => ({ getMomentIdMap: vi.fn() }));

import { mapTransfersToSupabase } from '../mapTransfersToSupabase';
import { getMomentIdMap } from '@/lib/moment/getMomentIdMap';
import type { Transfers_t } from '@/types/envio';
import { zeroAddress } from 'viem';

const mockGetMomentIdMap = vi.mocked(getMomentIdMap);

const MOMENT_ID = '550e8400-e29b-41d4-a716-446655440000';
const USDC_BASE = '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913' as const;

const base = (over: Partial<Transfers_t> = {}): Transfers_t => ({
  id: 'envio-1',
  collection: '0xCoL',
  token_id: '1',
  chain_id: 8453,
  recipient: '0xAbCdEf0000000000000000000000000000000001',
  quantity: '2',
  value: '1000000',
  currency: USDC_BASE,
  transaction_hash: '0xabc',
  transferred_at: 1700000000,
  ...over,
});

describe('mapTransfersToSupabase', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetMomentIdMap.mockResolvedValue(
      new Map([['0xcol:8453:1', MOMENT_ID]])
    );
  });

  it('returns empty rows for empty input after getMomentIdMap([])', async () => {
    mockGetMomentIdMap.mockResolvedValue(new Map());
    const result = await mapTransfersToSupabase([]);
    expect(result).toEqual({ rows: [], processedTransfers: [] });
    expect(mockGetMomentIdMap).toHaveBeenCalledWith([]);
  });

  it('skips transfers when moment is not in Supabase map', async () => {
    mockGetMomentIdMap.mockResolvedValue(new Map());
    const row = base();
    const result = await mapTransfersToSupabase([row]);
    expect(result).toEqual({ rows: [], processedTransfers: [] });
  });

  it('maps a single transfer with lowercased recipient and currency', async () => {
    const row = base();
    const result = await mapTransfersToSupabase([row]);

    expect(mockGetMomentIdMap).toHaveBeenCalledWith([row]);
    expect(result.rows).toHaveLength(1);
    expect(result.processedTransfers).toEqual([row]);
    expect(result.rows[0]).toEqual({
      recipient: '0xabcdef0000000000000000000000000000000001',
      quantity: 2,
      value: 1,
      currency: USDC_BASE.toLowerCase(),
      transaction_hash: '0xabc',
      transferred_at: '2023-11-14T22:13:20.000Z',
      moment: MOMENT_ID,
    });
  });

  it('uses 18 decimals when currency is zero address', async () => {
    const t = base({
      value: '1000000000000000000',
      currency: zeroAddress,
    });
    const result = await mapTransfersToSupabase([t]);

    expect(result.rows[0].value).toBe(1);
    expect(result.rows[0].currency).toBe(zeroAddress.toLowerCase());
  });

  it('sets value to null when value is missing or currency is missing', async () => {
    const a = await mapTransfersToSupabase([base({ value: undefined })]);
    expect(a.rows[0].value).toBeNull();

    const b = await mapTransfersToSupabase([base({ currency: undefined })]);
    expect(b.rows[0].value).toBeNull();
  });

  it('merges duplicate recipient+tx+moment by summing quantity and value', async () => {
    const t1 = base({ quantity: '3' });
    const t2 = base({ quantity: '5', value: '2000000' });

    const result = await mapTransfersToSupabase([t1, t2]);

    expect(result.rows).toHaveLength(1);
    expect(result.processedTransfers).toEqual([t1, t2]);
    expect(result.rows[0].quantity).toBe(8);
    expect(result.rows[0].value).toBe(3);
  });

  it('does not add value on merge when duplicate has no priced leg', async () => {
    const t1 = base({ value: '1000000', currency: USDC_BASE });
    const t2 = base({ value: undefined, currency: undefined });

    const result = await mapTransfersToSupabase([t1, t2]);

    expect(result.rows[0].quantity).toBe(4);
    expect(result.rows[0].value).toBe(1);
  });
});
