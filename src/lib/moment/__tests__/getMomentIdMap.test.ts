import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/supabase/in_process_moments/selectMoments', () => ({
  default: vi.fn(),
}));

import { getMomentIdMap } from '../getMomentIdMap';
import selectMoments from '@/lib/supabase/in_process_moments/selectMoments';

const mockSelectMoments = vi.mocked(selectMoments);

const entity = {
  id: '1',
  collection: '0xCOL',
  token_id: '3',
  chain_id: 8453,
  // other fields don't matter for this function
};

describe('getMomentIdMap', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns empty map for empty input without calling selectMoments', async () => {
    const result = await getMomentIdMap([]);
    expect(result.size).toBe(0);
    expect(mockSelectMoments).not.toHaveBeenCalled();
  });

  it('returns map keyed by lowercase collection:chainId:tokenId', async () => {
    mockSelectMoments.mockResolvedValue({
      data: [
        {
          id: 'moment-uuid',
          token_id: '3',
          collection: { address: '0xCOL', chain_id: 8453 },
        },
      ],
      error: null,
    } as any);

    const result = await getMomentIdMap([entity as any]);
    expect(result.get('0xcol:8453:3')).toBe('moment-uuid');
  });

  it('ignores moments not in the requested entities', async () => {
    mockSelectMoments.mockResolvedValue({
      data: [
        {
          id: 'mom-1',
          token_id: '3',
          collection: { address: '0xcol', chain_id: 8453 },
        },
        {
          id: 'mom-2',
          token_id: '99',
          collection: { address: '0xother', chain_id: 8453 },
        },
      ],
      error: null,
    } as any);

    const result = await getMomentIdMap([entity as any]);
    expect(result.size).toBe(1);
    expect(result.has('0xother:8453:99')).toBe(false);
  });

  it('throws when selectMoments returns an error', async () => {
    mockSelectMoments.mockResolvedValue({
      data: null,
      error: new Error('db error'),
    } as any);

    await expect(getMomentIdMap([entity as any])).rejects.toThrow('db error');
  });
});
