import { describe, it, expect } from 'vitest';
import buildUrlMapFromResults from '../buildUrlMapFromResults';
import type { MigrationCandidate } from '../getMigrationTargets';

const SUPABASE_IMAGE = 'https://abc.supabase.co/image.jpg';
const SUPABASE_MP4 = 'https://stream.mux.com/abc/highest.mp4';
const MUX_HLS = 'https://stream.mux.com/abc.m3u8';
const AR_IMAGE = 'ar://image-hash';
const AR_VIDEO = 'ar://video-hash';

describe('buildUrlMapFromResults', () => {
  it('maps each candidate key to its arweave URI', () => {
    const candidates: MigrationCandidate[] = [
      { key: 'image', value: SUPABASE_IMAGE },
      { key: 'content.uri', value: SUPABASE_MP4 },
    ];
    const results = new Map([
      [SUPABASE_IMAGE, AR_IMAGE],
      [SUPABASE_MP4, AR_VIDEO],
    ]);

    const urlMap = buildUrlMapFromResults(candidates, results, null);

    expect(urlMap.get('image')).toBe(AR_IMAGE);
    expect(urlMap.get('content.uri')).toBe(AR_VIDEO);
  });

  it('deduplicates: same source URL maps to same arweave URI for multiple keys', () => {
    const candidates: MigrationCandidate[] = [
      { key: 'image', value: SUPABASE_IMAGE },
      { key: 'content.uri', value: SUPABASE_IMAGE },
    ];
    const results = new Map([[SUPABASE_IMAGE, AR_IMAGE]]);

    const urlMap = buildUrlMapFromResults(candidates, results, null);

    expect(urlMap.get('image')).toBe(AR_IMAGE);
    expect(urlMap.get('content.uri')).toBe(AR_IMAGE);
  });

  it('remaps animation_url to content.uri result when hlsAnimationUrl is provided', () => {
    const candidates: MigrationCandidate[] = [
      { key: 'image', value: SUPABASE_IMAGE },
      { key: 'content.uri', value: SUPABASE_MP4 },
    ];
    const results = new Map([
      [SUPABASE_IMAGE, AR_IMAGE],
      [SUPABASE_MP4, AR_VIDEO],
    ]);

    const urlMap = buildUrlMapFromResults(candidates, results, MUX_HLS);

    expect(urlMap.get('animation_url')).toBe(AR_VIDEO);
  });

  it('does not set animation_url when hlsAnimationUrl is null', () => {
    const candidates: MigrationCandidate[] = [
      { key: 'image', value: SUPABASE_IMAGE },
    ];
    const results = new Map([[SUPABASE_IMAGE, AR_IMAGE]]);

    const urlMap = buildUrlMapFromResults(candidates, results, null);

    expect(urlMap.has('animation_url')).toBe(false);
  });

  it('does not set animation_url when content.uri was not uploaded', () => {
    const candidates: MigrationCandidate[] = [
      { key: 'image', value: SUPABASE_IMAGE },
    ];
    const results = new Map([[SUPABASE_IMAGE, AR_IMAGE]]);

    const urlMap = buildUrlMapFromResults(candidates, results, MUX_HLS);

    expect(urlMap.has('animation_url')).toBe(false);
  });

  it('returns empty map when candidates is empty', () => {
    const urlMap = buildUrlMapFromResults([], new Map(), null);
    expect(urlMap.size).toBe(0);
  });
});
