import { describe, it, expect } from 'vitest';
import { AuthErrorMessages } from '@/errors';
import isAuthError from '@/lib/auth/isAuthError';

describe('isAuthError', () => {
  it.each([
    AuthErrorMessages.INVALID_AUTH_TOKEN,
    AuthErrorMessages.NO_SOCIAL_OR_ARTIST_WALLET,
    AuthErrorMessages.INVALID_API_KEY,
    AuthErrorMessages.NO_ARTIST_ADDRESS_FOR_API_KEY,
    AuthErrorMessages.NO_VALID_AUTH_METHOD,
  ])('returns true for "%s"', (message) => {
    expect(isAuthError(new Error(message))).toBe(true);
  });

  it('returns false for an unrelated error', () => {
    expect(isAuthError(new Error('Something exploded'))).toBe(false);
  });

  it('returns false for null', () => {
    expect(isAuthError(null)).toBe(false);
  });

  it('returns false for undefined', () => {
    expect(isAuthError(undefined)).toBe(false);
  });

  it('returns false for an error with no message', () => {
    expect(isAuthError({})).toBe(false);
  });
});
