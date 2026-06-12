import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/workflows/migrateAssetToArweave', () => ({
  default: vi.fn(),
}));

import triggerMomentMigrations from '../triggerMomentMigrations';
import migrateAssetToArweave from '@/workflows/migrateAssetToArweave';
import type { CollectionInfo } from '@/lib/collection/getCollectionInfoMap';

const mockMigrate = vi.mocked(migrateAssetToArweave);

const COLLECTION = '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
const CREATOR = '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb';

const inProcessMoment = {
  id: 'moment-1',
  collection: COLLECTION,
  token_id: '1',
  uri: 'ipfs://meta',
  max_supply: '100',
  chain_id: 8453,
  created_at: 1000,
  updated_at: 2000,
  transaction_hash: '0xtx',
};

const infoMap = new Map<string, CollectionInfo>([
  [`${COLLECTION.toLowerCase()}:8453`, { id: 'col-uuid', creator: CREATOR }],
]);

describe('triggerMomentMigrations', () => {
  beforeEach(() => vi.clearAllMocks());

  it('triggers migration for each InProcess moment', () => {
    triggerMomentMigrations([inProcessMoment as any], infoMap);

    expect(mockMigrate).toHaveBeenCalledOnce();
    expect(mockMigrate).toHaveBeenCalledWith({
      artistAddress: CREATOR,
      moment: { collectionAddress: COLLECTION, tokenId: '1', chainId: 8453 },
      uri: 'ipfs://meta',
    });
  });

  it('skips when creator not found in infoMap', () => {
    triggerMomentMigrations([inProcessMoment as any], new Map());
    expect(mockMigrate).not.toHaveBeenCalled();
  });

  it('skips non-InProcess moments (no max_supply)', () => {
    const soundMoment = {
      id: 'sound-1',
      collection: COLLECTION,
      tier: 0,
      uri: 'ipfs://sound',
      chain_id: 8453,
      created_at: 1000,
      updated_at: 2000,
      transaction_hash: '0xtx',
    };

    triggerMomentMigrations([soundMoment as any], infoMap);
    expect(mockMigrate).not.toHaveBeenCalled();
  });

  it('does nothing for empty batch', () => {
    triggerMomentMigrations([], infoMap);
    expect(mockMigrate).not.toHaveBeenCalled();
  });
});
