import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../distribute', () => ({ distribute: vi.fn() }));
vi.mock('../mapPaymentsToSupabase', () => ({ mapPaymentsToSupabase: vi.fn() }));
vi.mock('@/lib/supabase/in_process_payments/upsertPayments', () => ({
  upsertPayments: vi.fn(),
}));
vi.mock('@/lib/supabase/in_process_artists/ensureArtists', () => ({
  ensureArtists: vi.fn(),
}));

import { processPaymentsInBatches } from '../processPaymentsInBatches';
import { distribute } from '../distribute';
import { mapPaymentsToSupabase } from '../mapPaymentsToSupabase';
import { upsertPayments } from '@/lib/supabase/in_process_payments/upsertPayments';
import { ensureArtists } from '@/lib/supabase/in_process_artists/ensureArtists';

const mockDistribute = vi.mocked(distribute);
const mockMapPayments = vi.mocked(mapPaymentsToSupabase);
const mockUpsert = vi.mocked(upsertPayments);
const mockEnsureArtists = vi.mocked(ensureArtists);

const deposit = {
  id: '1',
  collection: '0xcol',
  token_id: '1',
  currency: '0xUSDC',
  recipient: '0xrec',
  spender: '0xspe',
  amount: '1.0',
  chain_id: 8453,
  transaction_hash: '0xtx',
  transferred_at: 1000,
};

describe('processPaymentsInBatches', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockDistribute.mockResolvedValue(undefined);
    mockUpsert.mockResolvedValue(undefined as any);
    mockEnsureArtists.mockResolvedValue(undefined as any);
  });

  it('does nothing for empty array', async () => {
    await processPaymentsInBatches([]);
    expect(mockDistribute).not.toHaveBeenCalled();
    expect(mockMapPayments).not.toHaveBeenCalled();
  });

  it('calls distribute, ensures artists and upserts for each batch', async () => {
    const mapped = [
      {
        transaction_hash: '0xtx',
        buyer: '0xspe',
        moment: 'mid',
        amount: 1.0,
        transferred_at: 'ts',
      },
    ];
    mockMapPayments.mockResolvedValue(mapped);

    await processPaymentsInBatches([deposit]);

    expect(mockDistribute).toHaveBeenCalledWith([deposit]);
    expect(mockEnsureArtists).toHaveBeenCalledWith(['0xspe']);
    expect(mockUpsert).toHaveBeenCalledWith(mapped);
  });

  it('skips upsert when no mapped payments', async () => {
    mockMapPayments.mockResolvedValue([]);

    await processPaymentsInBatches([deposit]);

    expect(mockUpsert).not.toHaveBeenCalled();
  });

  it('throws when a batch errors (unlike other batch processors)', async () => {
    mockMapPayments.mockRejectedValue(new Error('fail'));
    await expect(processPaymentsInBatches([deposit])).rejects.toThrow('fail');
  });
});
