import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../mapSalesToSupabase', () => ({ mapSalesToSupabase: vi.fn() }));
vi.mock('@/lib/supabase/in_process_sales/upsertSales', () => ({
  upsertSales: vi.fn(),
}));
vi.mock(
  '@/lib/supabase/in_process_moment_fee_recipients/upsertFeeRecipients',
  () => ({ upsertFeeRecipients: vi.fn() })
);
vi.mock('@/lib/supabase/in_process_artists/ensureArtists', () => ({
  ensureArtists: vi.fn(),
}));

import { processSalesInBatches } from '../processSalesInBatches';
import { mapSalesToSupabase } from '../mapSalesToSupabase';
import { upsertSales } from '@/lib/supabase/in_process_sales/upsertSales';
import { upsertFeeRecipients } from '@/lib/supabase/in_process_moment_fee_recipients/upsertFeeRecipients';
import { ensureArtists } from '@/lib/supabase/in_process_artists/ensureArtists';

const mockMapSales = vi.mocked(mapSalesToSupabase);
const mockUpsertSales = vi.mocked(upsertSales);
const mockUpsertFeeRec = vi.mocked(upsertFeeRecipients);
const mockEnsureArtists = vi.mocked(ensureArtists);

const sale = {
  id: '1',
  collection: '0xcol',
  token_id: '1',
  sale_start: null,
  sale_end: null,
  max_tokens_per_address: null,
  price_per_token: '100',
  funds_recipient: '0xfunds',
  currency: '0xUSDC',
  chain_id: 8453,
  transaction_hash: '0xtx',
  created_at: 1000,
};

describe('processSalesInBatches', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUpsertSales.mockResolvedValue(undefined as any);
    mockUpsertFeeRec.mockResolvedValue(undefined as any);
    mockEnsureArtists.mockResolvedValue(undefined as any);
  });

  it('does nothing for empty array', async () => {
    mockMapSales.mockResolvedValue({ sales: [], feeRecipients: [] });
    await processSalesInBatches([]);
    expect(mockUpsertSales).not.toHaveBeenCalled();
  });

  it('maps, ensures artists, upserts sales and fee recipients', async () => {
    const mappedSales = [
      {
        moment: 'mid',
        currency: '0xUSDC',
        funds_recipient: '0xfunds',
        max_tokens_per_address: 0,
        price_per_token: 100,
        sale_end: 0,
        sale_start: 0,
        created_at: 'ts',
      },
    ];
    const mappedFeeRec = [
      { moment: 'mid', artist_address: '0xfunds', percent_allocation: 100 },
    ];
    mockMapSales.mockResolvedValue({
      sales: mappedSales,
      feeRecipients: mappedFeeRec,
    });

    await processSalesInBatches([sale]);

    expect(mockEnsureArtists).toHaveBeenCalledWith(['0xfunds']);
    expect(mockUpsertSales).toHaveBeenCalledWith(mappedSales);
    expect(mockUpsertFeeRec).toHaveBeenCalledWith(mappedFeeRec);
  });

  it('deduplicates artists passed to ensureArtists', async () => {
    const feeRecs = [
      { moment: 'mid', artist_address: '0xfunds', percent_allocation: 60 },
      { moment: 'mid', artist_address: '0xfunds', percent_allocation: 40 },
    ];
    mockMapSales.mockResolvedValue({
      sales: [{}] as any,
      feeRecipients: feeRecs,
    });

    await processSalesInBatches([sale]);
    expect(mockEnsureArtists).toHaveBeenCalledWith(['0xfunds']);
  });

  it('continues when a batch throws', async () => {
    mockMapSales.mockRejectedValue(new Error('fail'));
    await expect(processSalesInBatches([sale])).resolves.not.toThrow();
  });
});
