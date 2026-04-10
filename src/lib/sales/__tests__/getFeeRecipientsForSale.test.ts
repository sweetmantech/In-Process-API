import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/splits/isSplitContract', () => ({ default: vi.fn() }));
vi.mock('@/lib/splits/getSplitRecipients', () => ({ default: vi.fn() }));

import { getFeeRecipientsForSale } from '../getFeeRecipientsForSale';
import isSplitContract from '@/lib/splits/isSplitContract';
import getSplitRecipients from '@/lib/splits/getSplitRecipients';

const mockIsSplit = vi.mocked(isSplitContract);
const mockGetSplitRecipients = vi.mocked(getSplitRecipients);

const sale = {
  id: '1',
  collection: '0xcol',
  token_id: '1',
  sale_start: null,
  sale_end: null,
  max_tokens_per_address: null,
  price_per_token: '1000000',
  funds_recipient: '0xFUNDS',
  currency: '0xUSDC',
  chain_id: 8453,
  transaction_hash: '0xtx',
  created_at: 1000,
};

describe('getFeeRecipientsForSale', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns single 100% recipient when not a split', async () => {
    mockIsSplit.mockResolvedValue(false);

    const result = await getFeeRecipientsForSale(sale, 'moment-uuid');

    expect(result).toEqual([
      {
        moment: 'moment-uuid',
        artist_address: '0xfunds',
        percent_allocation: 100,
      },
    ]);
  });

  it('returns split recipients when is a split contract', async () => {
    mockIsSplit.mockResolvedValue(true);
    mockGetSplitRecipients.mockResolvedValue([
      { recipient: { address: '0xAlice' }, percentAllocation: 60 },
      { recipient: { address: '0xBob' }, percentAllocation: 40 },
    ] as any);

    const result = await getFeeRecipientsForSale(sale, 'moment-uuid');

    expect(result).toHaveLength(2);
    expect(result[0]).toMatchObject({
      artist_address: '0xalice',
      percent_allocation: 60,
    });
    expect(result[1]).toMatchObject({
      artist_address: '0xbob',
      percent_allocation: 40,
    });
  });

  it('returns empty array when split recipients are null', async () => {
    mockIsSplit.mockResolvedValue(true);
    mockGetSplitRecipients.mockResolvedValue(null);

    const result = await getFeeRecipientsForSale(sale, 'moment-uuid');
    expect(result).toEqual([]);
  });

  it('lowercases funds_recipient for non-split', async () => {
    mockIsSplit.mockResolvedValue(false);
    const result = await getFeeRecipientsForSale(
      { ...sale, funds_recipient: '0xAbCdEf' },
      'mid'
    );
    expect(result[0].artist_address).toBe('0xabcdef');
  });

  it('defaults percentAllocation to 0 when null', async () => {
    mockIsSplit.mockResolvedValue(true);
    mockGetSplitRecipients.mockResolvedValue([
      { recipient: { address: '0xAlice' }, percentAllocation: null },
    ] as any);

    const result = await getFeeRecipientsForSale(sale, 'moment-uuid');
    expect(result[0].percent_allocation).toBe(0);
  });
});
