import { describe, it, expect } from 'vitest';
import extractSlug from '@/lib/herenow/extractSlug';

describe('extractSlug', () => {
  it('returns slug from subdomain URL', () => {
    expect(extractSlug('https://my-slug.here.now/file.png')).toBe('my-slug');
  });

  it('returns slug from path-based URL', () => {
    expect(extractSlug('https://here.now/my-slug/file.png')).toBe('my-slug');
  });

  it('returns null for non-here.now URL', () => {
    expect(extractSlug('https://example.com/file.png')).toBeNull();
  });

  it('returns null for malformed URL', () => {
    expect(extractSlug('not a url')).toBeNull();
  });
});
