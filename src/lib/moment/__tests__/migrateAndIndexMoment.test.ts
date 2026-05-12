import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Address } from 'viem';

vi.mock('@/workflows/migrateMuxToArweave', () => ({
  default: vi.fn(),
}));
vi.mock('../indexMoment', () => ({ default: vi.fn() }));
vi.mock('@/lib/consts', () => ({ CHAIN_ID: 8453 }));

import migrateMuxToArweave from '@/workflows/migrateMuxToArweave';
import indexMoment from '../indexMoment';
import migrateAndIndexMoment from '../migrateAndIndexMoment';

const CONTRACT = '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' as Address;
const ARTIST = '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb' as Address;
const TOKEN_ID = '1';

const baseParams = {
  artistAddress: ARTIST,
  contractAddress: CONTRACT,
  tokenId: TOKEN_ID,
  channel: 'web' as const,
  token: { tokenMetadataURI: 'ar://token-meta', maxSupply: 5 },
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(indexMoment).mockResolvedValue(undefined);
});

describe('migrateAndIndexMoment', () => {
  it('starts migrate workflow with chain, collection, token, uri, and artist', async () => {
    await migrateAndIndexMoment(baseParams);

    expect(migrateMuxToArweave).toHaveBeenCalledWith({
      artistAddress: ARTIST,
      moment: {
        collectionAddress: CONTRACT,
        tokenId: TOKEN_ID,
        chainId: 8453,
      },
      uri: 'ar://token-meta',
    });
  });

  it('indexes the moment with the same identity and metadata', async () => {
    await migrateAndIndexMoment(baseParams);

    expect(indexMoment).toHaveBeenCalledWith({
      contractAddress: CONTRACT,
      tokenId: TOKEN_ID,
      artistAddress: ARTIST,
      channel: 'web',
      token: baseParams.token,
      chainId: 8453,
    });
  });

  it('starts migrate before awaiting index', async () => {
    const order: string[] = [];
    vi.mocked(migrateMuxToArweave).mockImplementation(() => {
      order.push('migrate');
    });
    vi.mocked(indexMoment).mockImplementation(async () => {
      order.push('index');
    });

    await migrateAndIndexMoment(baseParams);

    expect(order).toEqual(['migrate', 'index']);
  });
});
