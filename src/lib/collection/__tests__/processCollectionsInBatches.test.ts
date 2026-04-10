import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../mapCollectionsToSupabase', () => ({
  mapCollectionsToSupabase: vi.fn(),
}));
vi.mock('@/lib/supabase/in_process_artists/ensureArtists', () => ({
  ensureArtists: vi.fn(),
}));
vi.mock('@/lib/supabase/in_process_collections/upsertCollections', () => ({
  upsertCollections: vi.fn(),
}));
vi.mock('@/lib/supabase/broadcast/broadcastCollectionUpdated', () => ({
  broadcastCollectionUpdated: vi.fn(),
}));

import { processCollectionsInBatches } from '../processCollectionsInBatches';
import { mapCollectionsToSupabase } from '../mapCollectionsToSupabase';
import { ensureArtists } from '@/lib/supabase/in_process_artists/ensureArtists';
import { upsertCollections } from '@/lib/supabase/in_process_collections/upsertCollections';
import { broadcastCollectionUpdated } from '@/lib/supabase/broadcast/broadcastCollectionUpdated';

const mockMap = vi.mocked(mapCollectionsToSupabase);
const mockEnsureArtists = vi.mocked(ensureArtists);
const mockUpsertCollections = vi.mocked(upsertCollections);
const mockBroadcastCollectionUpdated = vi.mocked(broadcastCollectionUpdated);

const collection = {
  id: '1',
  address: '0xaddr',
  name: 'Col',
  uri: 'ipfs://x',
  default_admin: '0xcreator',
  chain_id: 8453,
  created_at: 1000,
  updated_at: 2000,
  transaction_hash: '0xtx',
};

describe('processCollectionsInBatches', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockEnsureArtists.mockResolvedValue(undefined as any);
    mockUpsertCollections.mockResolvedValue(undefined as any);
  });

  it('does nothing for empty array', async () => {
    await processCollectionsInBatches([]);
    expect(mockUpsertCollections).not.toHaveBeenCalled();
  });

  it('maps, ensures artists and upserts', async () => {
    const mapped = [
      {
        address: '0xaddr',
        name: 'Col',
        uri: 'uri',
        creator: '0xcreator',
        chain_id: 8453,
        created_at: 'ts',
        updated_at: 'ts',
        protocol: 'in_process' as const,
      },
    ];
    mockMap.mockReturnValue(mapped);

    await processCollectionsInBatches([collection as any]);

    expect(mockEnsureArtists).toHaveBeenCalledWith(['0xcreator']);
    expect(mockUpsertCollections).toHaveBeenCalledWith(mapped);
    expect(mockBroadcastCollectionUpdated).toHaveBeenCalledWith([collection]);
  });

  it('continues when a batch throws', async () => {
    mockMap.mockImplementation(() => {
      throw new Error('fail');
    });
    await expect(
      processCollectionsInBatches([collection as any])
    ).resolves.not.toThrow();
  });
});
