import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/workflows/migrateAssetToArweave', () => ({
  default: vi.fn(),
}));

import triggerCollectionMigrations from '../triggerCollectionMigrations';
import migrateAssetToArweave from '@/workflows/migrateAssetToArweave';

const mockMigrate = vi.mocked(migrateAssetToArweave);

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

describe('triggerCollectionMigrations', () => {
  beforeEach(() => vi.clearAllMocks());

  it('triggers migration for each InProcess collection', () => {
    triggerCollectionMigrations([inProcessCollection as any]);

    expect(mockMigrate).toHaveBeenCalledOnce();
    expect(mockMigrate).toHaveBeenCalledWith({
      artistAddress: '0xcreator',
      moment: { collectionAddress: '0xaddr', tokenId: '0', chainId: 8453 },
      uri: 'ipfs://x',
    });
  });

  it('skips non-InProcess collections (no default_admin)', () => {
    const catalogCollection = {
      id: '2',
      address: '0xaddr2',
      name: 'CatalogCol',
      uri: 'ipfs://y',
      creator: '0xcreator2',
      chain_id: 8453,
      created_at: 1000,
      updated_at: 2000,
      transaction_hash: '0xtx2',
    };

    triggerCollectionMigrations([catalogCollection as any]);

    expect(mockMigrate).not.toHaveBeenCalled();
  });

  it('does nothing for empty batch', () => {
    triggerCollectionMigrations([]);
    expect(mockMigrate).not.toHaveBeenCalled();
  });
});
