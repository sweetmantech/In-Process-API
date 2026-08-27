import { describe, it, expect } from 'vitest';
import buildMediaCachePath from '@/lib/media/buildMediaCachePath';
import buildMediaCacheHash from '@/lib/media/buildMediaCacheHash';

describe('buildMediaCachePath', () => {
  it('builds a deterministic path from hash and extension', () => {
    const hash = buildMediaCacheHash(['ar://abc', 420, undefined, 75, 'webp']);
    const path = buildMediaCachePath(hash, 'webp');

    expect(path.startsWith('media-cache/')).toBe(true);
    expect(path.endsWith('.webp')).toBe(true);
  });

  it('is stable for the same fingerprint parts', () => {
    const a = buildMediaCachePath(
      buildMediaCacheHash(['ar://abc', 420, undefined, 75, 'webp']),
      'webp'
    );
    const b = buildMediaCachePath(
      buildMediaCacheHash(['ar://abc', 420, undefined, 75, 'webp']),
      'webp'
    );

    expect(a).toBe(b);
  });

  it('changes path when fingerprint parts change', () => {
    const a = buildMediaCachePath(
      buildMediaCacheHash(['ar://abc', 420, undefined, 75, 'webp']),
      'webp'
    );
    const b = buildMediaCachePath(
      buildMediaCacheHash(['ar://abc', 800, undefined, 75, 'webp']),
      'webp'
    );

    expect(a).not.toBe(b);
  });
});
