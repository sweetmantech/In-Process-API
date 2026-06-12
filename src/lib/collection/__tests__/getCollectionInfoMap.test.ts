import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/supabase/in_process_collections/selectCollections', () => ({
  default: vi.fn(),
}));

import { getCollectionInfoMap } from '../getCollectionInfoMap';
import selectCollections from '@/lib/supabase/in_process_collections/selectCollections';

const mockSelectCollections = vi.mocked(selectCollections);

describe('getCollectionInfoMap', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns empty map for empty pairs', async () => {
    const result = await getCollectionInfoMap([]);
    expect(result.size).toBe(0);
    expect(mockSelectCollections).not.toHaveBeenCalled();
  });

  it('returns map keyed by lowercase address:chainId with id and creator', async () => {
    mockSelectCollections.mockResolvedValue({
      data: [
        {
          id: 'col-uuid',
          address: '0xABC',
          chain_id: 8453,
          creator: '0xcreator',
        },
      ],
      count: 1,
      error: null,
    } as any);

    const result = await getCollectionInfoMap([['0xABC', 8453]]);
    expect(result.get('0xabc:8453')).toEqual({
      id: 'col-uuid',
      creator: '0xcreator',
    });
  });

  it('ignores collections not in the requested pairs', async () => {
    mockSelectCollections.mockResolvedValue({
      data: [
        {
          id: 'col-1',
          address: '0xaaa',
          chain_id: 8453,
          creator: '0xcreator1',
        },
        {
          id: 'col-2',
          address: '0xbbb',
          chain_id: 8453,
          creator: '0xcreator2',
        },
      ],
      count: 2,
      error: null,
    } as any);

    const result = await getCollectionInfoMap([['0xaaa', 8453]]);
    expect(result.size).toBe(1);
    expect(result.has('0xbbb:8453')).toBe(false);
  });

  it('throws when selectCollections returns an error', async () => {
    mockSelectCollections.mockResolvedValue({
      data: null,
      count: null,
      error: new Error('db error'),
    } as any);

    await expect(getCollectionInfoMap([['0xabc', 8453]])).rejects.toThrow(
      'db error'
    );
  });

  it('passes the correct query to selectCollections', async () => {
    mockSelectCollections.mockResolvedValue({
      data: [],
      count: 0,
      error: null,
    } as any);
    await getCollectionInfoMap([['0xABC', 8453]]);
    expect(mockSelectCollections).toHaveBeenCalledWith({
      addresses: ['0xABC'],
    });
  });
});
