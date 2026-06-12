import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getAddress, type Address } from 'viem';
import indexMoment from '../indexMoment';

vi.mock('@/lib/consts', () => ({ CHAIN_ID: 8453 }));
vi.mock('@/lib/wallets/ensureWallets', () => ({ ensureWallets: vi.fn() }));
vi.mock('@/lib/supabase/in_process_collections/selectCollections', () => ({
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
vi.mock('@/lib/supabase/in_process_metadata/upsertMetadata', () => ({
  upsertMetadata: vi.fn(),
}));
vi.mock('@/lib/metadata/getMetadataHandler', () => ({
  default: vi.fn(),
}));

import { ensureWallets } from '@/lib/wallets/ensureWallets';
import selectCollections from '@/lib/supabase/in_process_collections/selectCollections';
import { upsertCollections } from '@/lib/supabase/in_process_collections/upsertCollections';
import selectMoments from '@/lib/supabase/in_process_moments/selectMoments';
import { upsertMoments } from '@/lib/supabase/in_process_moments/upsertMoments';
import { upsertMetadata } from '@/lib/supabase/in_process_metadata/upsertMetadata';
import getMetadataHandler from '@/lib/metadata/getMetadataHandler';

const CONTRACT = '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' as Address;
const ARTIST = '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb' as Address;
const TOKEN_ID = '1';
const COLLECTION_ID = 'col-uuid';
const MOMENT_ID = 'moment-uuid';

const MOCK_METADATA = {
  name: 'Test Moment',
  description: 'A test',
  image: 'ar://image',
  animation_url: null,
  external_url: null,
  content: { mime: 'image/jpeg', uri: 'ar://image' },
};

const baseParams = {
  contractAddress: CONTRACT,
  tokenId: TOKEN_ID,
  artistAddress: ARTIST,
  token: { tokenMetadataURI: 'ar://token-meta', maxSupply: 100 },
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(ensureWallets).mockResolvedValue(undefined as never);
  vi.mocked(selectCollections).mockResolvedValue({
    data: [],
    count: 0,
    error: null,
  } as never);
  vi.mocked(upsertCollections).mockResolvedValue([
    { id: COLLECTION_ID },
  ] as never);
  vi.mocked(selectMoments).mockResolvedValue({
    data: null,
    error: null,
  } as never);
  vi.mocked(upsertMoments).mockResolvedValue([{ id: MOMENT_ID }] as never);
  vi.mocked(getMetadataHandler).mockResolvedValue(MOCK_METADATA as never);
  vi.mocked(upsertMetadata).mockResolvedValue(undefined);
});

describe('indexMoment', () => {
  it('ensures artist exists with normalized address', async () => {
    await indexMoment(baseParams);
    expect(ensureWallets).toHaveBeenCalledWith([
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
    vi.mocked(selectCollections).mockResolvedValue({
      data: [{ id: COLLECTION_ID }],
      count: 1,
      error: null,
    } as never);

    await indexMoment(baseParams);

    expect(upsertCollections).not.toHaveBeenCalled();
  });

  it('upserts moment with channel when provided', async () => {
    vi.mocked(selectCollections).mockResolvedValue({
      data: [{ id: COLLECTION_ID }],
      count: 1,
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
    vi.mocked(selectCollections).mockResolvedValue({
      data: [{ id: COLLECTION_ID }],
      count: 1,
      error: null,
    } as never);

    await indexMoment(baseParams);

    const call = vi.mocked(upsertMoments).mock.calls[0][0][0];
    expect(call).not.toHaveProperty('channel');
  });

  it('skips moment upsert when moment already exists', async () => {
    vi.mocked(selectCollections).mockResolvedValue({
      data: [{ id: COLLECTION_ID }],
      count: 1,
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

  it('fetches and upserts metadata after moment is created', async () => {
    vi.mocked(selectCollections).mockResolvedValue({
      data: [{ id: COLLECTION_ID }],
      count: 1,
      error: null,
    } as never);

    await indexMoment(baseParams);

    expect(getMetadataHandler).toHaveBeenCalledWith({
      uri: baseParams.token.tokenMetadataURI,
    });
    expect(upsertMetadata).toHaveBeenCalledWith([
      {
        moment: MOMENT_ID,
        name: MOCK_METADATA.name,
        description: MOCK_METADATA.description,
        image: MOCK_METADATA.image,
        animation_url: null,
        external_url: null,
        content: MOCK_METADATA.content,
      },
    ]);
  });

  it('upserts metadata using existing moment id when moment already exists', async () => {
    const existingId = 'existing-moment-id';
    vi.mocked(selectCollections).mockResolvedValue({
      data: [{ id: COLLECTION_ID }],
      count: 1,
      error: null,
    } as never);
    vi.mocked(selectMoments).mockResolvedValue({
      data: [{ id: existingId }],
      error: null,
    } as never);

    await indexMoment(baseParams);

    expect(upsertMetadata).toHaveBeenCalledWith([
      expect.objectContaining({ moment: existingId }),
    ]);
  });

  it('logs error but does not throw when getMetadataHandler fails', async () => {
    vi.mocked(selectCollections).mockResolvedValue({
      data: [{ id: COLLECTION_ID }],
      count: 1,
      error: null,
    } as never);
    vi.mocked(getMetadataHandler).mockRejectedValue(new Error('fetch failed'));
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    await expect(indexMoment(baseParams)).resolves.toBeUndefined();
    expect(consoleSpy).toHaveBeenCalledWith(
      '[indexMoment] failed to upsert metadata:',
      expect.any(Error)
    );

    consoleSpy.mockRestore();
  });

  it('skips metadata upsert when momentId cannot be resolved', async () => {
    vi.mocked(upsertCollections).mockResolvedValue([] as never);

    await indexMoment(baseParams);

    expect(upsertMetadata).not.toHaveBeenCalled();
  });
});
