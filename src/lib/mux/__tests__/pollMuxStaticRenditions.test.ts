import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import pollMuxStaticRenditions from '../pollMuxStaticRenditions';

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
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

const readyAsset = {
  static_renditions: { status: 'ready' },
  playback_ids: [{ id: 'pb-id' }],
};

describe('pollMuxStaticRenditions', () => {
  it('returns playbackUrl and downloadUrl when renditions are ready on first poll', async () => {
    mockAsset.mockResolvedValue(readyAsset as any);

    const promise = pollMuxStaticRenditions('asset-id');
    await vi.runAllTimersAsync();
    const result = await promise;

    expect(result.playbackUrl).toBe('https://stream.mux.com/pb-id.m3u8');
    expect(result.downloadUrl).toBe('https://stream.mux.com/pb-id/highest.mp4');
  });

  it('retries until renditions become ready', async () => {
    const processingAsset = {
      static_renditions: { status: 'preparing' },
      playback_ids: [{ id: 'pb-id' }],
    };
    mockAsset
      .mockResolvedValueOnce(processingAsset as any)
      .mockResolvedValue(readyAsset as any);

    const promise = pollMuxStaticRenditions('asset-id');
    await vi.runAllTimersAsync();
    const result = await promise;

    expect(mockAsset).toHaveBeenCalledTimes(2);
    expect(result.playbackUrl).toBe('https://stream.mux.com/pb-id.m3u8');
  });

  it('resolves when highest.mp4 file is ready even without status field', async () => {
    mockAsset.mockResolvedValue({
      static_renditions: {
        files: [{ name: 'highest.mp4', status: 'ready' }],
      },
      playback_ids: [{ id: 'pb-id' }],
    } as any);

    const promise = pollMuxStaticRenditions('asset-id');
    await vi.runAllTimersAsync();
    const result = await promise;

    expect(result.downloadUrl).toBe('https://stream.mux.com/pb-id/highest.mp4');
  });

  it('throws when renditions are ready but no playback_id exists', async () => {
    mockAsset.mockResolvedValue({
      static_renditions: { status: 'ready' },
      playback_ids: [],
    } as any);

    await expect(pollMuxStaticRenditions('asset-id')).rejects.toThrow(
      'No playback ID found for Mux asset'
    );
  });

  it('keeps polling when static_renditions is undefined', async () => {
    mockAsset
      .mockResolvedValueOnce({
        static_renditions: undefined,
        playback_ids: [{ id: 'pb-id' }],
      } as any)
      .mockResolvedValue(readyAsset as any);

    const promise = pollMuxStaticRenditions('asset-id');
    await vi.runAllTimersAsync();
    const result = await promise;

    expect(mockAsset).toHaveBeenCalledTimes(2);
    expect(result.playbackUrl).toBe('https://stream.mux.com/pb-id.m3u8');
  });
});
