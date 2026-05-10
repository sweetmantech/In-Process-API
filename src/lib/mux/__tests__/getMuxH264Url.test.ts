import { describe, it, expect } from 'vitest';
import { h264UrlFromAsset, getMuxH264Url } from '../getMuxH264Url';
import type { Asset } from '@mux/mux-node/resources/video/assets';

const makeAsset = (overrides: Partial<Asset> = {}): Asset =>
  ({
    id: 'asset-id',
    status: 'ready',
    playback_ids: [{ id: 'playback-abc', policy: 'public' }],
    static_renditions: {
      status: 'ready',
      files: [
        { name: 'high.mp4', ext: 'mp4', bitrate: 5_000_000 },
        { name: 'low.mp4', ext: 'mp4', bitrate: 1_000_000 },
      ],
    },
    ...overrides,
  }) as Asset;

describe('h264UrlFromAsset', () => {
  it('returns URL with highest bitrate file', () => {
    const url = h264UrlFromAsset(makeAsset());
    expect(url).toBe('https://stream.mux.com/playback-abc/high.mp4');
  });

  it('returns null when no playback_ids', () => {
    expect(h264UrlFromAsset(makeAsset({ playback_ids: [] }))).toBeNull();
  });

  it('returns null when static_renditions status is not ready', () => {
    const asset = makeAsset({
      static_renditions: { status: 'preparing', files: [] },
    });
    expect(h264UrlFromAsset(asset)).toBeNull();
  });

  it('returns null when no mp4 files with bitrate', () => {
    const asset = makeAsset({
      static_renditions: {
        status: 'ready',
        files: [{ name: 'clip.mp4', ext: 'mp4', bitrate: undefined }],
      },
    });
    expect(h264UrlFromAsset(asset)).toBeNull();
  });

  it('returns null when static_renditions is undefined', () => {
    const asset = makeAsset({ static_renditions: undefined });
    expect(h264UrlFromAsset(asset)).toBeNull();
  });
});

describe('getMuxH264Url', () => {
  it('converts HLS URL to highest.mp4 URL', () => {
    const url = getMuxH264Url('https://stream.mux.com/playback-abc.m3u8');
    expect(url).toBe('https://stream.mux.com/playback-abc/highest.mp4');
  });

  it('returns null for non-mux URL', () => {
    expect(getMuxH264Url('https://example.com/video.mp4')).toBeNull();
  });

  it('returns null for URL without .m3u8', () => {
    expect(
      getMuxH264Url('https://stream.mux.com/playback-abc/highest.mp4')
    ).toBeNull();
  });

  it('returns null for empty string', () => {
    expect(getMuxH264Url('')).toBeNull();
  });
});
