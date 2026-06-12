import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../mapCollectionsToSupabase', () => ({
  mapCollectionsToSupabase: vi.fn(),
}));
vi.mock('@/lib/wallets/ensureWallets', () => ({
  ensureWallets: vi.fn(),
}));
vi.mock('@/lib/supabase/in_process_collections/upsertCollections', () => ({
  upsertCollections: vi.fn(),
}));
vi.mock('../triggerCollectionMigrations', () => ({
  default: vi.fn(),
}));

import { processCollectionsInBatches } from '../processCollectionsInBatches';
import { mapCollectionsToSupabase } from '../mapCollectionsToSupabase';
import { ensureWallets } from '@/lib/wallets/ensureWallets';
import { upsertCollections } from '@/lib/supabase/in_process_collections/upsertCollections';
import triggerCollectionMigrations from '../triggerCollectionMigrations';

const mockMap = vi.mocked(mapCollectionsToSupabase);
const mockEnsureArtists = vi.mocked(ensureWallets);
const mockUpsertCollections = vi.mocked(upsertCollections);
const mockTriggerMigrations = vi.mocked(triggerCollectionMigrations);

const inProcessCollection = {
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

const mappedCollection = {
  address: '0xaddr',
  name: 'Col',
  uri: 'uri',
  creator: '0xcreator',
  chain_id: 8453,
  created_at: 'ts',
  updated_at: 'ts',
  protocol: 'in_process' as const,
};

describe('processCollectionsInBatches', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockEnsureArtists.mockResolvedValue(undefined as any);
    mockUpsertCollections.mockResolvedValue(undefined as any);
    mockMap.mockReturnValue([mappedCollection]);
  });

  it('does nothing for empty array', async () => {
    await processCollectionsInBatches([]);
    expect(mockUpsertCollections).not.toHaveBeenCalled();
  });

  it('maps, ensures artists and upserts', async () => {
    await processCollectionsInBatches([inProcessCollection as any]);

    expect(mockEnsureArtists).toHaveBeenCalledWith(['0xcreator']);
    expect(mockUpsertCollections).toHaveBeenCalledWith([mappedCollection]);
  });

  it('delegates migration to triggerCollectionMigrations', async () => {
    await processCollectionsInBatches([inProcessCollection as any]);

    expect(mockTriggerMigrations).toHaveBeenCalledWith([inProcessCollection]);
  });

  it('continues when a batch throws', async () => {
    mockMap.mockImplementation(() => {
      throw new Error('fail');
    });
    await expect(
      processCollectionsInBatches([inProcessCollection as any])
    ).resolves.not.toThrow();
  });
});
