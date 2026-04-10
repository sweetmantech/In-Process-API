import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/moment/getMomentIdMap', () => ({ getMomentIdMap: vi.fn() }));
vi.mock('../getFeeRecipientsForSale', () => ({
  getFeeRecipientsForSale: vi.fn(),
}));

import { mapSalesToSupabase } from '../mapSalesToSupabase';
import { getMomentIdMap } from '@/lib/moment/getMomentIdMap';
import { getFeeRecipientsForSale } from '../getFeeRecipientsForSale';

const mockGetMomentIdMap = vi.mocked(getMomentIdMap);
const mockGetFeeRecipients = vi.mocked(getFeeRecipientsForSale);

const sale = {
  id: '1',
  collection: '0xCOL',
  token_id: '3',
  sale_start: '1000',
  sale_end: '2000',
  max_tokens_per_address: '5',
  price_per_token: '1000000',
  funds_recipient: '0xFUNDS',
  currency: '0xUSDC',
  chain_id: 8453,
  transaction_hash: '0xtx',
  created_at: 1700000000,
};

describe('mapSalesToSupabase', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns empty sales and feeRecipients for empty input', async () => {
    mockGetMomentIdMap.mockResolvedValue(new Map());
    const result = await mapSalesToSupabase([]);
    expect(result.sales).toEqual([]);
    expect(result.feeRecipients).toEqual([]);
  });

  it('maps sale to supabase insert shape', async () => {
    mockGetMomentIdMap.mockResolvedValue(
      new Map([['0xcol:8453:3', 'moment-uuid']])
    );
    mockGetFeeRecipients.mockResolvedValue([
      {
        moment: 'moment-uuid',
        artist_address: '0xfunds',
        percent_allocation: 100,
      },
    ]);

    const result = await mapSalesToSupabase([sale]);

    expect(result.sales[0]).toMatchObject({
      moment: 'moment-uuid',
      currency: '0xUSDC',
      funds_recipient: '0xfunds',
      max_tokens_per_address: 5,
      price_per_token: 1000000,
      sale_end: 2000,
      sale_start: 1000,
      created_at: new Date(1700000000 * 1000).toISOString(),
    });
  });

  it('includes fee recipients from getFeeRecipientsForSale', async () => {
    mockGetMomentIdMap.mockResolvedValue(
      new Map([['0xcol:8453:3', 'moment-uuid']])
    );
    const feeRecs = [
      {
        moment: 'moment-uuid',
        artist_address: '0xalice',
        percent_allocation: 60,
      },
      {
        moment: 'moment-uuid',
        artist_address: '0xbob',
        percent_allocation: 40,
      },
    ];
    mockGetFeeRecipients.mockResolvedValue(feeRecs);

    const result = await mapSalesToSupabase([sale]);
    expect(result.feeRecipients).toEqual(feeRecs);
  });

  it('skips sales whose moment is not found', async () => {
    mockGetMomentIdMap.mockResolvedValue(new Map());
    const result = await mapSalesToSupabase([sale]);
    expect(result.sales).toEqual([]);
    expect(mockGetFeeRecipients).not.toHaveBeenCalled();
  });

  it('handles null sale_start, sale_end, max_tokens_per_address', async () => {
    mockGetMomentIdMap.mockResolvedValue(
      new Map([['0xcol:8453:3', 'moment-uuid']])
    );
    mockGetFeeRecipients.mockResolvedValue([]);

    const result = await mapSalesToSupabase([
      {
        ...sale,
        sale_start: null,
        sale_end: null,
        max_tokens_per_address: null,
      },
    ]);
    expect(result.sales[0].sale_start).toBe(0);
    expect(result.sales[0].sale_end).toBe(0);
    expect(result.sales[0].max_tokens_per_address).toBe(0);
  });
});
