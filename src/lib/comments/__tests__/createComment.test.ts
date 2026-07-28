import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthMethod } from '@/types/auth';

vi.mock('@/lib/coinbase/getWalletSmartAccount', () => ({
  getWalletSmartAccount: vi.fn(),
}));
vi.mock('@/lib/coinbase/sendUserOperation', () => ({
  sendUserOperation: vi.fn(),
}));
vi.mock('@/lib/viem/getCommentCall', () => ({
  default: vi.fn(),
}));

import { getWalletSmartAccount } from '@/lib/coinbase/getWalletSmartAccount';
import { sendUserOperation } from '@/lib/coinbase/sendUserOperation';
import getCommentCall from '@/lib/viem/getCommentCall';
import { createComment } from '../createComment';

const COLLECTION = '0x1111111111111111111111111111111111111111' as const;
const SMART = '0x2222222222222222222222222222222222222222' as const;
const TX_HASH =
  '0xaabbccddaabbccddaabbccddaabbccddaabbccddaabbccddaabbccddaabbccdd' as const;

const artist = {
  artistId: 'artist-uuid',
  primaryWallet: '0x3333333333333333333333333333333333333333' as const,
  wallets: [],
  authMethod: AuthMethod.Privy,
};

describe('createComment', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getWalletSmartAccount).mockResolvedValue({
      address: SMART,
    } as any);
    vi.mocked(getCommentCall).mockReturnValue({
      to: '0xcomments',
      data: '0xcalldata',
    } as any);
    vi.mocked(sendUserOperation).mockResolvedValue({
      transactionHash: TX_HASH,
    } as any);
  });

  it('sends a zero-value comment call from the primary-wallet smart account', async () => {
    const result = await createComment({
      artist,
      collection: { address: COLLECTION, chainId: 8453 },
      tokenId: '1',
      text: 'hello',
    });

    expect(getWalletSmartAccount).toHaveBeenCalledWith({
      address: artist.primaryWallet,
    });
    expect(getCommentCall).toHaveBeenCalledWith(
      expect.objectContaining({
        commenter: SMART,
        collectionAddress: COLLECTION,
        tokenId: '1',
        text: 'hello',
        replyTo: undefined,
      })
    );
    expect(sendUserOperation).toHaveBeenCalledWith(
      expect.objectContaining({
        calls: [{ to: '0xcomments', data: '0xcalldata' }],
      })
    );
    expect(result.hash).toBe(TX_HASH);
  });

  it('passes replyTo through when moment identifiers match', async () => {
    const replyTo = {
      commenter: '0x4444444444444444444444444444444444444444' as const,
      contractAddress: COLLECTION,
      tokenId: '1',
      nonce:
        '0xcccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc',
    };

    await createComment({
      artist,
      collection: { address: COLLECTION, chainId: 8453 },
      tokenId: '1',
      text: 'reply',
      replyTo,
    });

    expect(getCommentCall).toHaveBeenCalledWith(
      expect.objectContaining({ replyTo })
    );
  });

  it('assumes replyTo is already validated before execution', async () => {
    await createComment({
      artist,
      collection: { address: COLLECTION, chainId: 8453 },
      tokenId: '1',
      text: 'reply',
      replyTo: {
        commenter: '0x4444444444444444444444444444444444444444',
        contractAddress: COLLECTION,
        tokenId: '1',
        nonce:
          '0xcccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc',
      },
    });

    expect(sendUserOperation).toHaveBeenCalled();
  });
});
