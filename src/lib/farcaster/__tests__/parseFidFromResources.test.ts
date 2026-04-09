import { describe, it, expect } from 'vitest';
import parseFidFromResources from '@/lib/farcaster/parseFidFromResources';

describe('parseFidFromResources', () => {
  it('returns the FID from a valid farcaster resource', () => {
    expect(parseFidFromResources(['farcaster://fid/12345'])).toBe(12345n);
  });

  it('returns null when resources is undefined', () => {
    expect(parseFidFromResources(undefined)).toBeNull();
  });

  it('returns null when resources is empty', () => {
    expect(parseFidFromResources([])).toBeNull();
  });

  it('returns null when no farcaster resource is present', () => {
    expect(
      parseFidFromResources(['https://example.com', 'ipfs://Qm123'])
    ).toBeNull();
  });

  it('returns the first FID when multiple farcaster resources are present', () => {
    expect(
      parseFidFromResources(['farcaster://fid/111', 'farcaster://fid/222'])
    ).toBe(111n);
  });

  it('ignores resources that partially match the pattern', () => {
    expect(
      parseFidFromResources(['farcaster://fid/', 'farcaster://fid/abc'])
    ).toBeNull();
  });

  it('handles FID of 1', () => {
    expect(parseFidFromResources(['farcaster://fid/1'])).toBe(1n);
  });
});
