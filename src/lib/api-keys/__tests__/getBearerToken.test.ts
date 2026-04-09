import { describe, it, expect } from 'vitest';
import { getBearerToken } from '@/lib/api-keys/getBearerToken';

describe('getBearerToken', () => {
  it('returns null when header is null', () => {
    expect(getBearerToken(null)).toBeNull();
  });

  it('returns null when header is empty string', () => {
    expect(getBearerToken('')).toBeNull();
  });

  it('returns null when header does not start with bearer', () => {
    expect(getBearerToken('Token abc123')).toBeNull();
  });

  it('returns null when header is just "Bearer" with no token', () => {
    expect(getBearerToken('Bearer')).toBeNull();
  });

  it('returns null when header is "Bearer " with only whitespace after prefix', () => {
    expect(getBearerToken('Bearer ')).toBeNull();
    expect(getBearerToken('Bearer   ')).toBeNull();
  });

  it('trims whitespace from extracted token', () => {
    expect(getBearerToken('Bearer  mytoken123  ')).toBe('mytoken123');
  });

  it('extracts token from valid Bearer header', () => {
    expect(getBearerToken('Bearer mytoken123')).toBe('mytoken123');
  });

  it('is case-insensitive for the Bearer prefix', () => {
    expect(getBearerToken('BEARER mytoken123')).toBe('mytoken123');
    expect(getBearerToken('bearer mytoken123')).toBe('mytoken123');
    expect(getBearerToken('Bearer mytoken123')).toBe('mytoken123');
  });

  it('preserves original case of the token', () => {
    expect(getBearerToken('Bearer MyMixedCaseToken')).toBe('MyMixedCaseToken');
  });

  it('returns null for Farcaster prefix', () => {
    expect(getBearerToken('Farcaster sometoken')).toBeNull();
  });
});
