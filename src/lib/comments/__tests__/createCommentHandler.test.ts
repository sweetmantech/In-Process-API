import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { AuthMethod } from '@/types/auth';
import { POST } from '@/app/api/moment/comments/[network]/[contract]/route';

vi.mock('@/authMiddleware', () => ({
  authMiddleware: vi.fn(),
}));
vi.mock('@/lib/comments/createComment', () => ({
  createComment: vi.fn(),
}));

import { authMiddleware } from '@/authMiddleware';
import { createComment } from '@/lib/comments/createComment';
import validateCreateCommentCAIP from '../validateCreateCommentCAIP';
import createCommentHandler from '../createCommentHandler';

const COLLECTION = '0x1111111111111111111111111111111111111111';
const artist = {
  artistId: 'artist-uuid',
  primaryWallet: '0x2222222222222222222222222222222222222222' as const,
  wallets: [],
  authMethod: AuthMethod.Privy,
};

describe('validateCreateCommentCAIP', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(authMiddleware).mockResolvedValue(artist);
  });

  it('returns artist, collection, and body fields', async () => {
    const req = new NextRequest('http://localhost/api', {
      method: 'POST',
      body: JSON.stringify({ tokenId: '1', text: 'hello' }),
      headers: { 'content-type': 'application/json' },
    });

    const result = await validateCreateCommentCAIP(req, {
      network: 'eip155:8453',
      contract: `erc1155:${COLLECTION}`,
    });

    expect(result).toMatchObject({
      artist,
      collection: {
        address: COLLECTION.toLowerCase(),
        chainId: 8453,
      },
      tokenId: '1',
      text: 'hello',
    });
  });

  it('returns 400 for invalid CAIP network', async () => {
    const req = new NextRequest('http://localhost/api', {
      method: 'POST',
      body: JSON.stringify({ tokenId: '1', text: 'hello' }),
      headers: { 'content-type': 'application/json' },
    });

    const result = await validateCreateCommentCAIP(req, {
      network: 'solana:1',
      contract: `erc1155:${COLLECTION}`,
    });

    expect(result).toBeInstanceOf(Response);
    expect((result as Response).status).toBe(400);
  });

  it('returns 400 when replyTo points to a different moment', async () => {
    const req = new NextRequest('http://localhost/api', {
      method: 'POST',
      body: JSON.stringify({
        tokenId: '1',
        text: 'reply',
        replyTo: {
          commenter: '0x3333333333333333333333333333333333333333',
          contractAddress: '0x4444444444444444444444444444444444444444',
          tokenId: '1',
          nonce:
            '0xcccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc',
        },
      }),
      headers: { 'content-type': 'application/json' },
    });

    const result = await validateCreateCommentCAIP(req, {
      network: 'eip155:8453',
      contract: `erc1155:${COLLECTION}`,
    });

    expect(result).toBeInstanceOf(Response);
    expect((result as Response).status).toBe(400);
  });
});

describe('createCommentHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(createComment).mockResolvedValue({
      hash: '0xhash' as any,
      chainId: 8453,
    });
  });

  it('returns JSON result from createComment', async () => {
    const res = await createCommentHandler({
      artist,
      collection: { address: COLLECTION as any, chainId: 8453 },
      tokenId: '1',
      text: 'hello',
    });

    expect(await res.json()).toEqual({ hash: '0xhash', chainId: 8453 });
  });

  it('returns 403 when the primary wallet is not a holder or admin', async () => {
    vi.mocked(createComment).mockRejectedValue({
      cause: {
        shortMessage: 'Execution reverted: NotTokenHolderOrAdmin()',
      },
    });

    const req = new NextRequest('http://localhost/api', {
      method: 'POST',
      body: JSON.stringify({ tokenId: '1', text: 'hello' }),
      headers: { 'content-type': 'application/json' },
    });

    const res = await POST(req, {
      params: Promise.resolve({
        network: 'eip155:8453',
        contract: `erc1155:${COLLECTION}`,
      }),
    });

    expect(res.status).toBe(403);
    expect(await res.json()).toEqual({
      message: 'Collect this moment before commenting.',
    });
  });
});
