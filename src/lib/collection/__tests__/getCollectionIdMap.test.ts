import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/supabase/in_process_collections/selectCollectionIds', () => ({
  default: vi.fn(),
}));

import { getCollectionIdMap } from '../getCollectionIdMap';
import selectCollectionIds from '@/lib/supabase/in_process_collections/selectCollectionIds';

const mockSelectCollectionIds = vi.mocked(selectCollectionIds);

describe('getCollectionIdMap', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns empty map for empty pairs', async () => {
    const result = await getCollectionIdMap([]);
    expect(result.size).toBe(0);
    expect(mockSelectCollectionIds).not.toHaveBeenCalled();
  });

  it('returns map keyed by lowercase address:chainId', async () => {
    mockSelectCollectionIds.mockResolvedValue({
      data: [{ id: 'col-uuid', address: '0xABC', chain_id: 8453 }],
      error: null,
    } as any);

    const result = await getCollectionIdMap([['0xABC', 8453]]);
    expect(result.get('0xabc:8453')).toBe('col-uuid');
  });

  it('ignores collections not in the requested pairs', async () => {
    mockSelectCollectionIds.mockResolvedValue({
      data: [
        { id: 'col-1', address: '0xaaa', chain_id: 8453 },
        { id: 'col-2', address: '0xbbb', chain_id: 8453 },
      ],
      error: null,
    } as any);

    const result = await getCollectionIdMap([['0xaaa', 8453]]);
    expect(result.size).toBe(1);
    expect(result.has('0xbbb:8453')).toBe(false);
  });

  it('throws when selectCollections returns an error', async () => {
    mockSelectCollectionIds.mockResolvedValue({
      data: null,
      error: new Error('db error'),
    } as any);

    await expect(getCollectionIdMap([['0xabc', 8453]])).rejects.toThrow(
      'db error'
    );
  });

  it('passes the correct query to selectCollectionIds', async () => {
    mockSelectCollectionIds.mockResolvedValue({ data: [], error: null } as any);
    await getCollectionIdMap([['0xABC', 8453]]);
    expect(mockSelectCollectionIds).toHaveBeenCalledWith([
      { address: '0xABC', chainId: 8453 },
    ]);
  });
});
