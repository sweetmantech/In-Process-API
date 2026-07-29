import { describe, expect, it } from 'vitest';
import parseCreateCommentError from '../parseCreateCommentError';

describe('parseCreateCommentError', () => {
  it('maps NotTokenHolderOrAdmin to a 403 user-facing message', () => {
    const result = parseCreateCommentError({
      message: 'User operation failed',
      cause: {
        shortMessage: 'Execution reverted: NotTokenHolderOrAdmin()',
      },
    });

    expect(result).toEqual({
      message:
        'Your primary wallet must hold or administer this token before it can post a comment.',
      status: 403,
    });
  });

  it('falls back to a 500 with the original message', () => {
    const result = parseCreateCommentError(new Error('boom'));

    expect(result).toEqual({
      message: 'boom',
      status: 500,
    });
  });
});
