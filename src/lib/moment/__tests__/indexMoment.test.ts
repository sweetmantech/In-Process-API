import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getAddress, type Address } from 'viem';
import indexMoment from '../indexMoment';

vi.mock('@/lib/consts', () => ({ CHAIN_ID: 8453 }));
vi.mock('@/lib/artists/ensureArtists', () => ({ ensureArtists: vi.fn() }));
vi.mock('@/lib/supabase/in_process_collections/selectCollection', () => ({
  default: vi.fn(),
}));
vi.mock('@/lib/supabase/in_process_collections/upsertCollections', () => ({
  upsertCollections: vi.fn(),
}));
vi.mock('@/lib/supabase/in_process_moments/selectMoments', () => ({
  default: vi.fn(),
}));
vi.mock('@/lib/supabase/in_process_moments/upsertMoments', () => ({
  upsertMoments: vi.fn(),
}));

import { ensureArtists } from '@/lib/artists/ensureArtists';
import selectCollection from '@/lib/supabase/in_process_collections/selectCollection';
import { upsertCollections } from '@/lib/supabase/in_process_collections/upsertCollections';
import selectMoments from '@/lib/supabase/in_process_moments/selectMoments';
import { upsertMoments } from '@/lib/supabase/in_process_moments/upsertMoments';

const CONTRACT = '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' as Address;
const ARTIST = '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb' as Address;
const TOKEN_ID = '1';
const COLLECTION_ID = 'col-uuid';

const baseParams = {
  contractAddress: CONTRACT,
  tokenId: TOKEN_ID,
  artistAddress: ARTIST,
  token: { tokenMetadataURI: 'ar://token-meta', maxSupply: 100 },
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(ensureArtists).mockResolvedValue(undefined as never);
  vi.mocked(selectCollection).mockResolvedValue({
    data: null,
    error: null,
  } as never);
  vi.mocked(upsertCollections).mockResolvedValue([
    { id: COLLECTION_ID },
  ] as never);
  vi.mocked(selectMoments).mockResolvedValue({
    data: null,
    error: null,
  } as never);
  vi.mocked(upsertMoments).mockResolvedValue([] as never);
});

describe('indexMoment', () => {
  it('ensures artist exists with normalized address', async () => {
    await indexMoment(baseParams);
    expect(ensureArtists).toHaveBeenCalledWith([
      getAddress(ARTIST).toLowerCase(),
    ]);
  });

  it('creates a new collection when none exists', async () => {
    await indexMoment(baseParams);
    expect(upsertCollections).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          address: getAddress(CONTRACT).toLowerCase(),
          creator: getAddress(ARTIST).toLowerCase(),
          protocol: 'in_process',
          chain_id: 8453,
          uri: '',
          name: '',
        }),
      ])
    );
  });

  it('skips collection upsert when collection already exists', async () => {
    vi.mocked(selectCollection).mockResolvedValue({
      data: { id: COLLECTION_ID },
      error: null,
    } as never);

    await indexMoment(baseParams);

    expect(upsertCollections).not.toHaveBeenCalled();
  });

  it('upserts moment with channel when provided', async () => {
    vi.mocked(selectCollection).mockResolvedValue({
      data: { id: COLLECTION_ID },
      error: null,
    } as never);

    await indexMoment({ ...baseParams, channel: 'sms' });

    expect(upsertMoments).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          collection: COLLECTION_ID,
          token_id: Number(TOKEN_ID),
          channel: 'sms',
        }),
      ])
    );
  });

  it('omits channel from upsert when not provided', async () => {
    vi.mocked(selectCollection).mockResolvedValue({
      data: { id: COLLECTION_ID },
      error: null,
    } as never);

    await indexMoment(baseParams);

    const call = vi.mocked(upsertMoments).mock.calls[0][0][0];
    expect(call).not.toHaveProperty('channel');
  });

  it('skips moment upsert when moment already exists', async () => {
    vi.mocked(selectCollection).mockResolvedValue({
      data: { id: COLLECTION_ID },
      error: null,
    } as never);
    vi.mocked(selectMoments).mockResolvedValue({
      data: [{ id: 'existing-moment-id' }],
      error: null,
    } as never);

    await indexMoment(baseParams);

    expect(upsertMoments).not.toHaveBeenCalled();
  });

  it('returns early without upserting moment when collectionId cannot be resolved', async () => {
    vi.mocked(upsertCollections).mockResolvedValue([] as never);

    await indexMoment(baseParams);

    expect(upsertMoments).not.toHaveBeenCalled();
  });
});
