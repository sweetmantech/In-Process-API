import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../mapCollectorsToSupabase', () => ({
  mapCollectorsToSupabase: vi.fn(),
}));
vi.mock('@/lib/supabase/in_process_collectors/upsertCollectors', () => ({
  upsertCollectors: vi.fn(),
}));
vi.mock('@/lib/supabase/in_process_artists/ensureArtists', () => ({
  ensureArtists: vi.fn(),
}));

import { processCollectorsInBatches } from '../processCollectorsInBatches';
import { mapCollectorsToSupabase } from '../mapCollectorsToSupabase';
import { upsertCollectors } from '@/lib/supabase/in_process_collectors/upsertCollectors';
import { ensureArtists } from '@/lib/supabase/in_process_artists/ensureArtists';

const mockMap = vi.mocked(mapCollectorsToSupabase);
const mockUpsert = vi.mocked(upsertCollectors);
const mockEnsureArtists = vi.mocked(ensureArtists);

const collector = {
  id: '1',
  collection: '0xcol',
  token_id: '1',
  collector: '0xabc',
  amount: '1',
  chain_id: 8453,
  transaction_hash: '0xtx',
  collected_at: 1000,
};

describe('processCollectorsInBatches', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUpsert.mockResolvedValue(undefined as any);
    mockEnsureArtists.mockResolvedValue(undefined as any);
  });

  it('does nothing for empty array', async () => {
    mockMap.mockResolvedValue([]);
    await processCollectorsInBatches([]);
    expect(mockUpsert).not.toHaveBeenCalled();
  });

  it('maps, ensures artists (deduped) and upserts', async () => {
    const mapped = [
      {
        moment: 'mid',
        collector: '0xabc',
        amount: 1,
        transaction_hash: '0xtx',
        collected_at: 'ts',
      },
      {
        moment: 'mid2',
        collector: '0xabc',
        amount: 1,
        transaction_hash: '0xtx2',
        collected_at: 'ts',
      },
    ];
    mockMap.mockResolvedValue(mapped);

    await processCollectorsInBatches([collector, collector]);

    expect(mockEnsureArtists).toHaveBeenCalledWith(['0xabc']);
    expect(mockUpsert).toHaveBeenCalledWith(mapped);
  });

  it('continues when a batch throws', async () => {
    mockMap.mockRejectedValue(new Error('fail'));
    await expect(
      processCollectorsInBatches([collector])
    ).resolves.not.toThrow();
  });
});
