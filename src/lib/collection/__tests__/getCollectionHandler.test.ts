import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/supabase/in_process_collections/selectCollections', () => ({
  default: vi.fn(),
}));
vi.mock('@/lib/supabase/in_process_admins/selectAdmins', () => ({
  default: vi.fn(),
}));
vi.mock('@/lib/protocolSdk/ipfs/token-metadata', () => ({
  fetchTokenMetadata: vi.fn(),
}));

import selectCollections from '@/lib/supabase/in_process_collections/selectCollections';
import selectAdmins from '@/lib/supabase/in_process_admins/selectAdmins';
import { fetchTokenMetadata } from '@/lib/protocolSdk/ipfs/token-metadata';
import getCollectionHandler from '@/lib/collection/getCollectionHandler';

const baseInput = { collectionAddress: '0xabc', chainId: 8453 };

const mockCollection = {
  id: 'coll-1',
  address: '0xabc',
  chain_id: 8453,
  uri: 'ar://some-hash',
};

const mockMetadata = { name: 'My Collection', image: 'ar://img' };

const mockAdmins = [
  { artist_address: '0xadmin1' },
  { artist_address: '0xadmin2' },
  { artist_address: '0xadmin1' },
];

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(selectCollections).mockResolvedValue({
    data: [mockCollection] as any,
    count: 1,
    error: null,
  });
  vi.mocked(selectAdmins).mockResolvedValue(mockAdmins as any);
  vi.mocked(fetchTokenMetadata).mockResolvedValue(mockMetadata as any);
});

describe('getCollectionHandler', () => {
  it('returns collection with metadata and unique admins on success', async () => {
    const res = await getCollectionHandler(baseInput);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.id).toBe('coll-1');
    expect(body.metadata).toEqual(mockMetadata);
    expect(body.admins).toEqual(['0xadmin1', '0xadmin2']);
  });

  it('deduplicates and sorts admins', async () => {
    vi.mocked(selectAdmins).mockResolvedValue([
      { artist_address: '0xzzz' },
      { artist_address: '0xaaa' },
      { artist_address: '0xaaa' },
    ] as any);

    const res = await getCollectionHandler(baseInput);
    const body = await res.json();

    expect(body.admins).toEqual(['0xaaa', '0xzzz']);
  });

  it('calls selectCollections with address and chainId', async () => {
    await getCollectionHandler(baseInput);

    expect(selectCollections).toHaveBeenCalledWith({
      addresses: ['0xabc'],
      chainId: 8453,
    });
  });

  it('calls selectAdmins with collection id and token_id 0', async () => {
    await getCollectionHandler(baseInput);

    expect(selectAdmins).toHaveBeenCalledWith({
      moments: [{ collectionId: 'coll-1', token_id: 0 }],
    });
  });

  it('returns 404 when collection is not found', async () => {
    vi.mocked(selectCollections).mockResolvedValue({
      data: [],
      count: 0,
      error: null,
    });

    const res = await getCollectionHandler(baseInput);
    const body = await res.json();

    expect(res.status).toBe(404);
    expect(body.status).toBe('error');
    expect(body.message).toBe('Collection not found');
  });

  it('returns 500 when selectCollections returns an error', async () => {
    vi.mocked(selectCollections).mockResolvedValue({
      data: null,
      count: null,
      error: { message: 'db error' },
    });

    const res = await getCollectionHandler(baseInput);
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body.status).toBe('error');
    expect(body.message).toBe('db error');
  });

  it('returns null metadata when fetchTokenMetadata throws', async () => {
    vi.mocked(fetchTokenMetadata).mockRejectedValue(new Error('ipfs timeout'));

    const res = await getCollectionHandler(baseInput);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.metadata).toBeNull();
  });
});
