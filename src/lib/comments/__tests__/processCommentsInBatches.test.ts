import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../mapCommentsToSupabase', () => ({ mapCommentsToSupabase: vi.fn() }));
vi.mock('@/lib/supabase/in_process_moment_comments/upsertComments', () => ({
  upsertComments: vi.fn(),
}));
vi.mock('@/lib/supabase/in_process_artists/ensureArtists', () => ({
  ensureArtists: vi.fn(),
}));

import { processCommentsInBatches } from '../processCommentsInBatches';
import { mapCommentsToSupabase } from '../mapCommentsToSupabase';
import { upsertComments } from '@/lib/supabase/in_process_moment_comments/upsertComments';
import { ensureArtists } from '@/lib/supabase/in_process_artists/ensureArtists';

const mockMap = vi.mocked(mapCommentsToSupabase);
const mockUpsert = vi.mocked(upsertComments);
const mockEnsureArtists = vi.mocked(ensureArtists);

const comment = {
  id: '1',
  collection: '0xcol',
  token_id: '1',
  sender: '0xabc',
  comment: 'hi',
  chain_id: 8453,
  commented_at: 1000,
  transaction_hash: '0xtx',
};

describe('processCommentsInBatches', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUpsert.mockResolvedValue(undefined as any);
    mockEnsureArtists.mockResolvedValue(undefined as any);
  });

  it('does nothing for empty array', async () => {
    mockMap.mockResolvedValue([]);
    await processCommentsInBatches([]);
    expect(mockUpsert).not.toHaveBeenCalled();
  });

  it('maps, ensures artists and upserts', async () => {
    const mapped = [
      {
        moment: 'mid',
        artist_address: '0xabc',
        comment: 'hi',
        commented_at: 'ts',
      },
    ];
    mockMap.mockResolvedValue(mapped);

    await processCommentsInBatches([comment]);

    expect(mockEnsureArtists).toHaveBeenCalledWith(['0xabc']);
    expect(mockUpsert).toHaveBeenCalledWith(mapped);
  });

  it('continues when a batch throws', async () => {
    mockMap.mockRejectedValue(new Error('fail'));
    await expect(processCommentsInBatches([comment])).resolves.not.toThrow();
  });
});
