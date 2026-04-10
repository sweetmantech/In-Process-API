import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../mapAirdropsToSupabase', () => ({ mapAirdropsToSupabase: vi.fn() }));
vi.mock('@/lib/supabase/in_process_airdrops/upsertAirdrops', () => ({
  upsertAirdrops: vi.fn(),
}));
vi.mock('@/lib/supabase/in_process_artists/ensureArtists', () => ({
  ensureArtists: vi.fn(),
}));

import { processAirdropsInBatches } from '../processAirdropsInBatches';
import { mapAirdropsToSupabase } from '../mapAirdropsToSupabase';
import { upsertAirdrops } from '@/lib/supabase/in_process_airdrops/upsertAirdrops';
import { ensureArtists } from '@/lib/supabase/in_process_artists/ensureArtists';

const mockMapAirdrops = vi.mocked(mapAirdropsToSupabase);
const mockUpsertAirdrops = vi.mocked(upsertAirdrops);
const mockEnsureArtists = vi.mocked(ensureArtists);

const airdrop = {
  id: '1',
  recipient: '0xabc',
  collection: '0xcol',
  token_id: '1',
  amount: '2',
  chain_id: 8453,
  updated_at: 1000,
};

describe('processAirdropsInBatches', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUpsertAirdrops.mockResolvedValue(undefined as any);
    mockEnsureArtists.mockResolvedValue(undefined as any);
  });

  it('does nothing for empty array', async () => {
    mockMapAirdrops.mockResolvedValue([]);
    await processAirdropsInBatches([]);
    expect(mockUpsertAirdrops).not.toHaveBeenCalled();
  });

  it('maps, ensures artists and upserts', async () => {
    const mapped = [
      { moment: 'mid', recipient: '0xabc', amount: 2, updated_at: 'ts' },
    ];
    mockMapAirdrops.mockResolvedValue(mapped);

    await processAirdropsInBatches([airdrop]);

    expect(mockEnsureArtists).toHaveBeenCalledWith(['0xabc']);
    expect(mockUpsertAirdrops).toHaveBeenCalledWith(mapped);
  });

  it('deduplicates recipients passed to ensureArtists', async () => {
    const mapped = [
      { moment: 'mid1', recipient: '0xabc', amount: 1, updated_at: 'ts' },
      { moment: 'mid2', recipient: '0xabc', amount: 1, updated_at: 'ts' },
    ];
    mockMapAirdrops.mockResolvedValue(mapped);

    await processAirdropsInBatches([airdrop, airdrop]);

    expect(mockEnsureArtists).toHaveBeenCalledWith(['0xabc']);
  });

  it('continues when a batch throws', async () => {
    mockMapAirdrops.mockRejectedValue(new Error('fail'));
    await expect(processAirdropsInBatches([airdrop])).resolves.not.toThrow();
  });
});
