import { describe, it, expect } from 'vitest';
import { decodeFunctionData, zeroAddress, zeroHash } from 'viem';
import { commentsABI } from '@zoralabs/protocol-deployments';
import { COMMENTS_ADDRESS } from '@/lib/consts';
import getCommentCall from '../getCommentCall';

const COLLECTION = '0x1111111111111111111111111111111111111111' as const;
const COMMENTER = '0x2222222222222222222222222222222222222222' as const;
const CHAIN_ID = 8453;

describe('getCommentCall', () => {
  it('encodes a free top-level delegateComment with no value and empty replyTo', () => {
    const call = getCommentCall({
      chainId: CHAIN_ID,
      commenter: COMMENTER,
      collectionAddress: COLLECTION,
      tokenId: '3',
      text: 'hello',
    });

    expect(call.to).toBe(COMMENTS_ADDRESS[CHAIN_ID]);
    expect(call).not.toHaveProperty('value');

    const decoded = decodeFunctionData({
      abi: commentsABI,
      data: call.data,
    });
    expect(decoded.functionName).toBe('delegateComment');
    expect(decoded.args?.[0]).toBe(COMMENTER);
    expect(decoded.args?.[1]).toBe(COLLECTION);
    expect(decoded.args?.[2]).toBe(3n);
    expect(decoded.args?.[3]).toBe('hello');
    expect(decoded.args?.[4]).toEqual({
      commenter: zeroAddress,
      contractAddress: zeroAddress,
      tokenId: 0n,
      nonce: zeroHash,
    });
    expect(decoded.args?.[5]).toBe(zeroAddress);
    expect(decoded.args?.[6]).toBe(zeroAddress);
  });

  it('encodes replyTo when provided', () => {
    const nonce =
      '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb' as const;
    const call = getCommentCall({
      chainId: CHAIN_ID,
      commenter: COMMENTER,
      collectionAddress: COLLECTION,
      tokenId: '3',
      text: 'reply',
      replyTo: {
        commenter: '0x3333333333333333333333333333333333333333',
        contractAddress: COLLECTION,
        tokenId: '3',
        nonce,
      },
    });

    const decoded = decodeFunctionData({
      abi: commentsABI,
      data: call.data,
    });
    expect(decoded.args?.[4]).toEqual({
      commenter: '0x3333333333333333333333333333333333333333',
      contractAddress: COLLECTION,
      tokenId: 3n,
      nonce,
    });
  });

  it('throws when comments address is missing for the chain', () => {
    expect(() =>
      getCommentCall({
        chainId: 1,
        commenter: COMMENTER,
        collectionAddress: COLLECTION,
        tokenId: '1',
        text: 'nope',
      })
    ).toThrow(/not configured/);
  });
});
