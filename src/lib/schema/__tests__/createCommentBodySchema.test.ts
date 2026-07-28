import { describe, it, expect } from 'vitest';
import { createCommentBodySchema } from '../createCommentBodySchema';

describe('createCommentBodySchema', () => {
  it('accepts a top-level comment body', () => {
    const result = createCommentBodySchema.safeParse({
      tokenId: '1',
      text: 'hello',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.tokenId).toBe('1');
      expect(result.data.replyTo).toBeUndefined();
    }
  });

  it('coerces numeric tokenId to string', () => {
    const result = createCommentBodySchema.safeParse({
      tokenId: 7,
      text: 'hello',
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.tokenId).toBe('7');
  });

  it('rejects empty text', () => {
    const result = createCommentBodySchema.safeParse({
      tokenId: '1',
      text: '',
    });
    expect(result.success).toBe(false);
  });

  it('accepts a replyTo identifier', () => {
    const result = createCommentBodySchema.safeParse({
      tokenId: '1',
      text: 'reply',
      replyTo: {
        commenter: '0x1111111111111111111111111111111111111111',
        contractAddress: '0x2222222222222222222222222222222222222222',
        tokenId: '1',
        nonce:
          '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
      },
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid replyTo nonce', () => {
    const result = createCommentBodySchema.safeParse({
      tokenId: '1',
      text: 'reply',
      replyTo: {
        commenter: '0x1111111111111111111111111111111111111111',
        contractAddress: '0x2222222222222222222222222222222222222222',
        tokenId: '1',
        nonce: '0xdead',
      },
    });
    expect(result.success).toBe(false);
  });
});
