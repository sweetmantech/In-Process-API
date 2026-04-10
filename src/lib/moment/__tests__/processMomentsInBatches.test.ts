import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../mapMomentsToSupabase', () => ({ mapMomentsToSupabase: vi.fn() }));
vi.mock('@/lib/supabase/in_process_moments/upsertMoments', () => ({
  upsertMoments: vi.fn(),
}));
vi.mock('../mapMetadataToSupabase', () => ({ mapMetadataToSupabase: vi.fn() }));
vi.mock('@/lib/supabase/in_process_metadata/upsertMetadata', () => ({
  upsertMetadata: vi.fn(),
}));
vi.mock('@/lib/supabase/in_process_artists/upsertArtistNames', () => ({
  upsertArtistNames: vi.fn(),
}));
vi.mock('@/lib/supabase/broadcast/broadcastMomentUpdated', () => ({
  broadcastMomentUpdated: vi.fn(),
}));
vi.mock('@/lib/supabase/broadcast/broadcastMomentsCountUpdated', () => ({
  broadcastMomentsCountUpdated: vi.fn(),
}));

import { processMomentsInBatches } from '../processMomentsInBatches';
import { mapMomentsToSupabase } from '../mapMomentsToSupabase';
import { upsertMoments } from '@/lib/supabase/in_process_moments/upsertMoments';
import { mapMetadataToSupabase } from '../mapMetadataToSupabase';
import { upsertMetadata } from '@/lib/supabase/in_process_metadata/upsertMetadata';
import { upsertArtistNames } from '@/lib/supabase/in_process_artists/upsertArtistNames';
import { broadcastMomentUpdated } from '@/lib/supabase/broadcast/broadcastMomentUpdated';
import { broadcastMomentsCountUpdated } from '@/lib/supabase/broadcast/broadcastMomentsCountUpdated';

const mockMapMomentsToSupabase = vi.mocked(mapMomentsToSupabase);
const mockUpsertMoments = vi.mocked(upsertMoments);
const mockMapMetadataToSupabase = vi.mocked(mapMetadataToSupabase);
const mockUpsertMetadata = vi.mocked(upsertMetadata);
const mockUpsertArtistNames = vi.mocked(upsertArtistNames);
const mockBroadcastMomentUpdated = vi.mocked(broadcastMomentUpdated);
const mockBroadcastMomentsCountUpdated = vi.mocked(
  broadcastMomentsCountUpdated
);

const makeMoment = (token_id = '1') => ({
  id: '1',
  collection: '0xcol',
  token_id,
  uri: 'ipfs://x',
  max_supply: '100',
  chain_id: 8453,
  created_at: 1000,
  updated_at: 2000,
  transaction_hash: '0xtx',
});

const mappedMoment = {
  collection: 'col-uuid',
  token_id: 1,
  uri: 'ipfs://x',
  max_supply: 100,
  created_at: 'ts',
  updated_at: 'ts',
};

const upsertedMoment = {
  id: 'uuid',
  uri: 'ipfs://x',
  collection: { creator: '0xcreator' },
};

describe('processMomentsInBatches', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockMapMomentsToSupabase.mockResolvedValue([mappedMoment]);
    mockUpsertMoments.mockResolvedValue([upsertedMoment]);
    mockMapMetadataToSupabase.mockResolvedValue({
      records: [],
      artistNamesByAddresses: {},
    });
    mockUpsertMetadata.mockResolvedValue(undefined as any);
    mockUpsertArtistNames.mockResolvedValue(undefined as any);
  });

  it('does nothing for empty array', async () => {
    await processMomentsInBatches([]);
    expect(mockMapMomentsToSupabase).not.toHaveBeenCalled();
    expect(mockBroadcastMomentUpdated).not.toHaveBeenCalled();
    expect(mockBroadcastMomentsCountUpdated).not.toHaveBeenCalled();
  });

  it('maps, upserts and broadcasts moment:updated', async () => {
    const moment = makeMoment();

    await processMomentsInBatches([moment]);

    expect(mockMapMomentsToSupabase).toHaveBeenCalledWith([moment]);
    expect(mockUpsertMoments).toHaveBeenCalledWith([mappedMoment]);
    expect(mockBroadcastMomentUpdated).toHaveBeenCalledWith([moment]);
  });

  it('broadcasts moments:count-updated after all batches complete', async () => {
    await processMomentsInBatches([makeMoment()]);

    expect(mockBroadcastMomentsCountUpdated).toHaveBeenCalledTimes(1);
  });

  it('does not broadcast moments:count-updated when nothing was processed', async () => {
    mockMapMomentsToSupabase.mockResolvedValue([]);
    mockUpsertMoments.mockResolvedValue([]);

    await processMomentsInBatches([makeMoment()]);

    expect(mockBroadcastMomentsCountUpdated).not.toHaveBeenCalled();
  });

  it('continues processing other batches when one fails', async () => {
    mockMapMomentsToSupabase.mockRejectedValueOnce(new Error('batch error'));

    await expect(
      processMomentsInBatches([makeMoment(), makeMoment('2')])
    ).resolves.not.toThrow();
  });

  it('does not broadcast when batch throws', async () => {
    mockMapMomentsToSupabase.mockRejectedValue(new Error('fail'));

    await processMomentsInBatches([makeMoment()]);

    expect(mockBroadcastMomentUpdated).not.toHaveBeenCalled();
  });
});
