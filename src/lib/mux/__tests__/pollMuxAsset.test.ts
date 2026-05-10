import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import pollMuxAsset from '../pollMuxAsset';

vi.mock('@/lib/mux', () => ({
  default: {
    video: {
      uploads: { retrieve: vi.fn() },
      assets: { retrieve: vi.fn() },
    },
  },
}));

import mux from '@/lib/mux';

const mockUpload = vi.mocked(mux.video.uploads.retrieve);
const mockAsset = vi.mocked(mux.video.assets.retrieve);

beforeEach(() => {
  vi.clearAllMocks();
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

const readyAsset = {
  status: 'ready',
  playback_ids: [{ id: 'pb-id' }],
  master: { status: 'ready', url: 'https://stream.mux.com/pb-id/master.mp4' },
};

describe('pollMuxAsset', () => {
  it('returns playbackUrl and downloadUrl when asset is ready on first poll', async () => {
    mockUpload.mockResolvedValue({ asset_id: 'asset-id' } as any);
    mockAsset.mockResolvedValue(readyAsset as any);

    const promise = pollMuxAsset('upload-id');
    await vi.runAllTimersAsync();
    const result = await promise;

    expect(result.playbackUrl).toBe('https://stream.mux.com/pb-id.m3u8');
    expect(result.downloadUrl).toBe('https://stream.mux.com/pb-id/master.mp4');
  });

  it('retries until asset_id appears', async () => {
    mockUpload
      .mockResolvedValueOnce({ asset_id: null } as any)
      .mockResolvedValue({ asset_id: 'asset-id' } as any);
    mockAsset.mockResolvedValue(readyAsset as any);

    const promise = pollMuxAsset('upload-id');
    await vi.runAllTimersAsync();
    const result = await promise;

    expect(mockUpload).toHaveBeenCalledTimes(2);
    expect(result.playbackUrl).toBe('https://stream.mux.com/pb-id.m3u8');
  });

  it('retries until asset status becomes ready', async () => {
    const processingAsset = {
      status: 'preparing',
      playback_ids: [{ id: 'pb-id' }],
      master: { status: 'preparing' },
    };
    mockUpload.mockResolvedValue({ asset_id: 'asset-id' } as any);
    mockAsset
      .mockResolvedValueOnce(processingAsset as any)
      .mockResolvedValue(readyAsset as any);

    const promise = pollMuxAsset('upload-id');
    await vi.runAllTimersAsync();
    const result = await promise;

    expect(mockAsset).toHaveBeenCalledTimes(2);
    expect(result.playbackUrl).toBe('https://stream.mux.com/pb-id.m3u8');
  });

  it('throws after max retries are exhausted', async () => {
    mockUpload.mockResolvedValue({ asset_id: null } as any);

    const promise = pollMuxAsset('upload-id');
    const assertion = expect(promise).rejects.toThrow(
      'Mux asset processing timeout'
    );
    await vi.runAllTimersAsync();
    await assertion;
  });
});
