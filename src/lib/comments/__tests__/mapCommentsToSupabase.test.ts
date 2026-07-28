import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/moment/getMomentIdMap', () => ({ getMomentIdMap: vi.fn() }));
vi.mock('@/lib/wallets/resolveArtistAddressFromMaybeSmartWallet', () => ({
  default: vi.fn(),
}));

import { mapCommentsToSupabase } from '../mapCommentsToSupabase';
import { getMomentIdMap } from '@/lib/moment/getMomentIdMap';
import resolveArtistAddressFromMaybeSmartWallet from '@/lib/wallets/resolveArtistAddressFromMaybeSmartWallet';

const mockGetMomentIdMap = vi.mocked(getMomentIdMap);
const mockResolveArtistAddress = vi.mocked(
  resolveArtistAddressFromMaybeSmartWallet
);

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
  beforeEach(() => {
    vi.clearAllMocks();
    mockResolveArtistAddress.mockImplementation(async ({ address }) =>
      address.toLowerCase()
    );
  });

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
        comment_id: null,
        reply_to_id: null,
        nonce: null,
        sparks_quantity: null,
      },
    ]);
  });

  it('maps Zora Comments protocol fields for replies', async () => {
    mockGetMomentIdMap.mockResolvedValue(
      new Map([['0xcol:8453:2', 'moment-uuid']])
    );
    const result = await mapCommentsToSupabase([
      {
        ...comment,
        comment_id: '0xabc',
        reply_to_id: '0xparent',
        nonce: '0x1',
        sparks_quantity: '1',
      },
    ]);
    expect(result[0]).toMatchObject({
      comment_id: '0xabc',
      reply_to_id: '0xparent',
      nonce: '0x1',
      sparks_quantity: 1,
    });
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

  it('resolves smart-wallet sender to primary artist address', async () => {
    mockGetMomentIdMap.mockResolvedValue(
      new Map([['0xcol:8453:2', 'moment-uuid']])
    );
    mockResolveArtistAddress.mockResolvedValue('0xartist');
    const result = await mapCommentsToSupabase([
      { ...comment, sender: '0xSmartWallet' },
    ]);
    expect(mockResolveArtistAddress).toHaveBeenCalledWith({
      address: '0xSmartWallet',
      chainId: 8453,
    });
    expect(result[0].artist_address).toBe('0xartist');
  });

  it('resolves each unique sender once per batch', async () => {
    mockGetMomentIdMap.mockResolvedValue(
      new Map([
        ['0xcol:8453:2', 'moment-uuid'],
        ['0xcol:8453:3', 'moment-uuid-2'],
      ])
    );
    await mapCommentsToSupabase([
      comment,
      { ...comment, id: '2', token_id: '3' },
    ]);
    expect(mockResolveArtistAddress).toHaveBeenCalledTimes(1);
  });
});
