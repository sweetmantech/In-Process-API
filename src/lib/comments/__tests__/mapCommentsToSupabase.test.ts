import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/moment/getMomentIdMap', () => ({ getMomentIdMap: vi.fn() }));

import { mapCommentsToSupabase } from '../mapCommentsToSupabase';
import { getMomentIdMap } from '@/lib/moment/getMomentIdMap';

const mockGetMomentIdMap = vi.mocked(getMomentIdMap);

const comment = {
  id: '1',
  collection: '0xCOL',
  token_id: '2',
  sender: '0xSENDER',
  comment: 'hello world',
  chain_id: 8453,
  commented_at: 1700000000,
  transaction_hash: '0xtx',
};

describe('mapCommentsToSupabase', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns empty array for empty input', async () => {
    mockGetMomentIdMap.mockResolvedValue(new Map());
    expect(await mapCommentsToSupabase([])).toEqual([]);
  });

  it('maps comment to supabase insert shape', async () => {
    mockGetMomentIdMap.mockResolvedValue(
      new Map([['0xcol:8453:2', 'moment-uuid']])
    );
    const result = await mapCommentsToSupabase([comment]);
    expect(result).toEqual([
      {
        moment: 'moment-uuid',
        artist_address: '0xsender',
        comment: 'hello world',
        commented_at: new Date(1700000000 * 1000).toISOString(),
      },
    ]);
  });

  it('stores null for undefined comment text', async () => {
    mockGetMomentIdMap.mockResolvedValue(
      new Map([['0xcol:8453:2', 'moment-uuid']])
    );
    const result = await mapCommentsToSupabase([
      { ...comment, comment: undefined },
    ]);
    expect(result[0].comment).toBeNull();
  });

  it('skips comments whose moment is not found', async () => {
    mockGetMomentIdMap.mockResolvedValue(new Map());
    expect(await mapCommentsToSupabase([comment])).toEqual([]);
  });

  it('lowercases sender address', async () => {
    mockGetMomentIdMap.mockResolvedValue(
      new Map([['0xcol:8453:2', 'moment-uuid']])
    );
    const result = await mapCommentsToSupabase([
      { ...comment, sender: '0xAbCdEf' },
    ]);
    expect(result[0].artist_address).toBe('0xabcdef');
  });
});
