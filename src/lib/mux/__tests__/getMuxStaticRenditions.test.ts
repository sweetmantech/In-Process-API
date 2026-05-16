import { describe, it, expect, vi, beforeEach } from 'vitest';
import getMuxStaticRenditions from '../getMuxStaticRenditions';

vi.mock('@/lib/mux', () => ({
  default: {
    video: {
      assets: { retrieve: vi.fn() },
    },
  },
}));

import mux from '@/lib/mux';

const mockAsset = vi.mocked(mux.video.assets.retrieve);

beforeEach(() => {
  vi.clearAllMocks();
});

const readyAsset = {
  static_renditions: { status: 'ready' },
  playback_ids: [{ id: 'pb-id' }],
};

describe('getMuxStaticRenditions', () => {
  it('returns playbackUrl and downloadUrl when renditions are ready', async () => {
    mockAsset.mockResolvedValue(readyAsset as any);

    const result = await getMuxStaticRenditions('asset-id');

    expect(result?.playbackUrl).toBe('https://stream.mux.com/pb-id.m3u8');
    expect(result?.downloadUrl).toBe(
      'https://stream.mux.com/pb-id/highest.mp4'
    );
  });

  it('returns null when renditions are not ready', async () => {
    mockAsset.mockResolvedValue({
      static_renditions: { status: 'preparing' },
      playback_ids: [{ id: 'pb-id' }],
    } as any);

    const result = await getMuxStaticRenditions('asset-id');

    expect(result).toBeNull();
  });

  it('returns playbackUrl and downloadUrl when highest.mp4 file is ready', async () => {
    mockAsset.mockResolvedValue({
      static_renditions: {
        files: [{ name: 'highest.mp4', status: 'ready' }],
      },
      playback_ids: [{ id: 'pb-id' }],
    } as any);

    const result = await getMuxStaticRenditions('asset-id');

    expect(result?.downloadUrl).toBe(
      'https://stream.mux.com/pb-id/highest.mp4'
    );
  });

  it('returns null when renditions are ready but no playback_id exists', async () => {
    mockAsset.mockResolvedValue({
      static_renditions: { status: 'ready' },
      playback_ids: [],
    } as any);

    const result = await getMuxStaticRenditions('asset-id');

    expect(result).toBeNull();
  });

  it('returns null when static_renditions is undefined', async () => {
    mockAsset.mockResolvedValue({
      static_renditions: undefined,
      playback_ids: [{ id: 'pb-id' }],
    } as any);

    const result = await getMuxStaticRenditions('asset-id');

    expect(result).toBeNull();
  });
});
