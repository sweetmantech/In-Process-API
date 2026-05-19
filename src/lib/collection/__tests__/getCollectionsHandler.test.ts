import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/supabase/in_process_collections/selectCollections', () => ({
  default: vi.fn(),
}));

import selectCollections from '@/lib/supabase/in_process_collections/selectCollections';
import getCollectionsHandler from '@/lib/collection/getCollectionsHandler';

const baseInput = { limit: 10, page: 1, chain_id: 8453 };

const mockCollection = { id: 'c1', address: '0xabc', chain_id: 8453 };

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(selectCollections).mockResolvedValue({
    data: [mockCollection] as any,
    count: 1,
    error: null,
  });
});

describe('getCollectionsHandler', () => {
  it('returns collections and pagination on success', async () => {
    const res = await getCollectionsHandler(baseInput);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.status).toBe('success');
    expect(body.collections).toEqual([mockCollection]);
    expect(body.pagination).toEqual({ page: 1, limit: 10, total_pages: 1 });
  });

  it('calls selectCollections with correct args', async () => {
    await getCollectionsHandler({ ...baseInput, artist: '0xartist' });

    expect(selectCollections).toHaveBeenCalledWith({
      artists: ['0xartist'],
      limit: 10,
      page: 1,
      chainId: 8453,
    });
  });

  it('passes undefined artists when artist is not provided', async () => {
    await getCollectionsHandler(baseInput);

    expect(selectCollections).toHaveBeenCalledWith(
      expect.objectContaining({ artists: undefined })
    );
  });

  it('calculates total_pages from count', async () => {
    vi.mocked(selectCollections).mockResolvedValue({
      data: [] as any,
      count: 25,
      error: null,
    });

    const res = await getCollectionsHandler({ ...baseInput, limit: 10 });
    const body = await res.json();

    expect(body.pagination.total_pages).toBe(3);
  });

  it('returns 500 when selectCollections returns an error', async () => {
    vi.mocked(selectCollections).mockResolvedValue({
      data: null,
      count: null,
      error: { message: 'db error' } as any,
    });

    const res = await getCollectionsHandler(baseInput);
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body.status).toBe('error');
    expect(body.message).toBe('db error');
  });
});
