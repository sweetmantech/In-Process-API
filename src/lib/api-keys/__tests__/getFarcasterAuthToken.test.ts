import { describe, it, expect } from 'vitest';
import { getFarcasterAuthToken } from '@/lib/api-keys/getFarcasterAuthToken';

describe('getFarcasterAuthToken', () => {
  it('returns null when header is null', () => {
    expect(getFarcasterAuthToken(null)).toBeNull();
  });

  it('returns null when header is empty string', () => {
    expect(getFarcasterAuthToken('')).toBeNull();
  });

  it('returns null when header does not start with farcaster', () => {
    expect(getFarcasterAuthToken('Bearer abc123')).toBeNull();
    expect(getFarcasterAuthToken('Token abc123')).toBeNull();
  });

  it('extracts token from valid Farcaster header', () => {
    expect(getFarcasterAuthToken('Farcaster mytoken123')).toBe('mytoken123');
  });

  it('is case-insensitive for the Farcaster prefix', () => {
    expect(getFarcasterAuthToken('FARCASTER mytoken123')).toBe('mytoken123');
    expect(getFarcasterAuthToken('farcaster mytoken123')).toBe('mytoken123');
    expect(getFarcasterAuthToken('Farcaster mytoken123')).toBe('mytoken123');
  });

  it('preserves original case of the token', () => {
    expect(getFarcasterAuthToken('Farcaster MyMixedCaseToken')).toBe(
      'MyMixedCaseToken'
    );
  });

  it('returns null for Bearer prefix', () => {
    expect(getFarcasterAuthToken('Bearer sometoken')).toBeNull();
  });
});
