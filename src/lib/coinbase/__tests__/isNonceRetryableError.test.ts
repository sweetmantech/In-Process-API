import { describe, it, expect } from 'vitest';
import isNonceRetryableError from '../isNonceRetryableError';

describe('isNonceRetryableError', () => {
  it('returns true for an AA25 error message', () => {
    const error = new Error(
      'validation reverted: [reason]: AA25 invalid account nonce'
    );

    expect(isNonceRetryableError(error)).toBe(true);
  });

  it('returns true for a lowercase "invalid account nonce" message', () => {
    const error = new Error('invalid account nonce');

    expect(isNonceRetryableError(error)).toBe(true);
  });

  it('returns false for an unrelated error', () => {
    const error = new Error('insufficient funds for gas');

    expect(isNonceRetryableError(error)).toBe(false);
  });

  it('returns false for non-Error values', () => {
    expect(isNonceRetryableError('AA25 invalid account nonce')).toBe(false);
    expect(isNonceRetryableError(undefined)).toBe(false);
  });
});
