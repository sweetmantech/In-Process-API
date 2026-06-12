import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Address } from 'viem';
import indexMomentBatch from '../indexMomentBatch';

vi.mock('@/lib/viem/publicClient', () => ({ getPublicClient: vi.fn() }));
vi.mock('../indexMoment', () => ({ default: vi.fn() }));

import { getPublicClient } from '@/lib/viem/publicClient';
import indexMoment from '../indexMoment';

const CONTRACT = '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' as Address;
const ACCOUNT = '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb' as Address;
const BLOCK_NUMBER = 1000n;
const BLOCK_TIMESTAMP = 1700000000n;

const makeToken = (uri: string) => ({
  tokenMetadataURI: uri,
  maxSupply: 0,
});

const baseParams = {
  contractAddress: CONTRACT,
  tokenIds: ['1'],
  tokens: [makeToken('ar://meta-1')],
  account: ACCOUNT,
  channel: 'telegram' as const,
  chainId: 8453,
  blockNumber: BLOCK_NUMBER,
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(getPublicClient).mockReturnValue({
    getBlock: vi.fn().mockResolvedValue({ timestamp: BLOCK_TIMESTAMP }),
  } as never);
  vi.mocked(indexMoment).mockResolvedValue(undefined);
});

describe('indexMomentBatch', () => {
  it('fetches the block once regardless of token count', async () => {
    const params = {
      ...baseParams,
      tokenIds: ['1', '2', '3'],
      tokens: [
        makeToken('ar://meta-1'),
        makeToken('ar://meta-2'),
        makeToken('ar://meta-3'),
      ],
    };

    await indexMomentBatch(params);

    const mockClient = vi.mocked(getPublicClient).mock.results[0].value;
    expect(mockClient.getBlock).toHaveBeenCalledTimes(1);
    expect(mockClient.getBlock).toHaveBeenCalledWith({
      blockNumber: BLOCK_NUMBER,
    });
  });

  it('calls indexMoment once per token with blockTimestamp', async () => {
    const params = {
      ...baseParams,
      tokenIds: ['1', '2'],
      tokens: [makeToken('ar://meta-1'), makeToken('ar://meta-2')],
    };

    await indexMomentBatch(params);

    expect(indexMoment).toHaveBeenCalledTimes(2);
    expect(indexMoment).toHaveBeenCalledWith(
      expect.objectContaining({
        tokenId: '1',
        token: params.tokens[0],
        blockTimestamp: Number(BLOCK_TIMESTAMP),
      })
    );
    expect(indexMoment).toHaveBeenCalledWith(
      expect.objectContaining({
        tokenId: '2',
        token: params.tokens[1],
        blockTimestamp: Number(BLOCK_TIMESTAMP),
      })
    );
  });

  it('passes contractAddress, account, channel, chainId to each indexMoment', async () => {
    await indexMomentBatch(baseParams);

    expect(indexMoment).toHaveBeenCalledWith(
      expect.objectContaining({
        contractAddress: CONTRACT,
        artistAddress: ACCOUNT,
        channel: 'telegram',
        chainId: 8453,
      })
    );
  });
});
