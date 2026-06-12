import { describe, it, expect } from 'vitest';
import { isNonPermanentUri } from '../isNonPermanentUri';

describe('isNonPermanentUri', () => {
  it('returns false for ar:// URIs', () => {
    expect(isNonPermanentUri('ar://abc123')).toBe(false);
  });

  it('returns false for ipfs:// URIs', () => {
    expect(isNonPermanentUri('ipfs://QmHash')).toBe(false);
  });

  it('returns true for https:// URIs', () => {
    expect(isNonPermanentUri('https://example.com/file.jpg')).toBe(true);
  });

  it('returns true for Supabase public URLs', () => {
    expect(
      isNonPermanentUri(
        'https://abc.supabase.co/storage/v1/object/public/bucket/file.jpg'
      )
    ).toBe(true);
  });

  it('returns true for Mux stream URLs', () => {
    expect(isNonPermanentUri('https://stream.mux.com/abc.m3u8')).toBe(true);
  });

  it('returns false for null', () => {
    expect(isNonPermanentUri(null)).toBe(false);
  });

  it('returns false for undefined', () => {
    expect(isNonPermanentUri(undefined)).toBe(false);
  });

  it('returns false for empty string', () => {
    expect(isNonPermanentUri('')).toBe(false);
  });
});
