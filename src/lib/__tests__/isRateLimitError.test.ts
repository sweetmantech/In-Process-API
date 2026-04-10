import { describe, it, expect } from 'vitest';
import { isRateLimitError } from '../isRateLimitError';

describe('isRateLimitError', () => {
  it('returns false for null/undefined/non-objects', () => {
    expect(isRateLimitError(null)).toBe(false);
    expect(isRateLimitError(undefined)).toBe(false);
    expect(isRateLimitError('string error')).toBe(false);
    expect(isRateLimitError(429)).toBe(false);
  });

  it('detects status === 429', () => {
    expect(isRateLimitError({ status: 429 })).toBe(true);
  });

  it('detects statusCode === 429', () => {
    expect(isRateLimitError({ statusCode: 429 })).toBe(true);
  });

  it('detects code === 429', () => {
    expect(isRateLimitError({ code: 429 })).toBe(true);
  });

  it('detects "429" in message', () => {
    expect(
      isRateLimitError({ message: 'HTTP error 429 Too Many Requests' })
    ).toBe(true);
  });

  it('detects "rate limit" in message (case insensitive)', () => {
    expect(isRateLimitError({ message: 'Rate Limit exceeded' })).toBe(true);
    expect(isRateLimitError({ message: 'rate limit hit' })).toBe(true);
  });

  it('detects response.status === 429', () => {
    expect(isRateLimitError({ response: { status: 429 } })).toBe(true);
  });

  it('returns false for non-429 errors', () => {
    expect(isRateLimitError({ status: 500 })).toBe(false);
    expect(isRateLimitError({ message: 'Network error' })).toBe(false);
    expect(isRateLimitError({ response: { status: 500 } })).toBe(false);
  });
});
