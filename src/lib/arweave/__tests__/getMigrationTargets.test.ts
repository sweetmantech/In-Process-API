import { describe, it, expect } from 'vitest';
import getMigrationTargets from '../getMigrationTargets';
import type { TokenMetadataJson } from '@/lib/protocolSdk/ipfs/types';

const SUPABASE_IMAGE = 'https://abc.supabase.co/storage/v1/object/public/bucket/photo.jpg';
const SUPABASE_META = 'https://abc.supabase.co/storage/v1/object/public/bucket/meta.json';
const MUX_HLS = 'https://stream.mux.com/abc.m3u8';
const MUX_MP4 = 'https://stream.mux.com/abc/highest.mp4';
const AR_URI = 'ar://abc123';

const base: TokenMetadataJson = { name: 'Test', attributes: [] };

describe('getMigrationTargets', () => {
  describe('hasTargets', () => {
    it('is false when all URIs are already permanent', () => {
      const { hasTargets } = getMigrationTargets({
        ...base,
        image: AR_URI,
        content: { mime: 'image/jpeg', uri: AR_URI },
      });
      expect(hasTargets).toBe(false);
    });

    it('is false when no media fields are set', () => {
      const { hasTargets } = getMigrationTargets(base);
      expect(hasTargets).toBe(false);
    });

    it('is true when any URI is non-permanent', () => {
      const { hasTargets } = getMigrationTargets({
        ...base,
        image: SUPABASE_IMAGE,
      });
      expect(hasTargets).toBe(true);
    });
  });

  describe('photo moment (image + content.uri, same Supabase URL)', () => {
    const metadata: TokenMetadataJson = {
      ...base,
      image: SUPABASE_IMAGE,
      content: { mime: 'image/jpeg', uri: SUPABASE_IMAGE },
    };

    it('returns both image and content.uri as download candidates', () => {
      const { downloadCandidates } = getMigrationTargets(metadata);
      expect(downloadCandidates).toEqual([
        { key: 'image', value: SUPABASE_IMAGE },
        { key: 'content.uri', value: SUPABASE_IMAGE },
      ]);
    });

    it('hlsAnimationUrl is null', () => {
      expect(getMigrationTargets(metadata).hlsAnimationUrl).toBeNull();
    });
  });

  describe('video moment (HLS animation_url + MP4 content.uri)', () => {
    const metadata: TokenMetadataJson = {
      ...base,
      image: SUPABASE_IMAGE,
      animation_url: MUX_HLS,
      content: { mime: 'video/mp4', uri: MUX_MP4 },
    };

    it('excludes HLS animation_url from download candidates', () => {
      const { downloadCandidates } = getMigrationTargets(metadata);
      expect(downloadCandidates.find((c) => c.key === 'animation_url')).toBeUndefined();
    });

    it('includes image and content.uri in download candidates', () => {
      const { downloadCandidates } = getMigrationTargets(metadata);
      expect(downloadCandidates).toEqual([
        { key: 'image', value: SUPABASE_IMAGE },
        { key: 'content.uri', value: MUX_MP4 },
      ]);
    });

    it('sets hlsAnimationUrl to the HLS URL', () => {
      expect(getMigrationTargets(metadata).hlsAnimationUrl).toBe(MUX_HLS);
    });
  });

  describe('already migrated fields', () => {
    it('excludes ar:// image from candidates', () => {
      const { downloadCandidates } = getMigrationTargets({
        ...base,
        image: AR_URI,
        content: { mime: 'image/jpeg', uri: SUPABASE_META },
      });
      expect(downloadCandidates.find((c) => c.key === 'image')).toBeUndefined();
    });
  });
});
