import { describe, it, expect, vi, beforeEach } from 'vitest';
import getMuxAssetHandler from '../getMuxAssetHandler';

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
});

describe('getMuxAssetHandler', () => {
  it('returns processing status when upload has no asset_id yet', async () => {
    mockUpload.mockResolvedValue({ asset_id: null } as any);

    const res = await getMuxAssetHandler('upload-id');
    const body = await res.json();

    expect(body.status).toBe('processing');
    expect(body.message).toBe('Asset creation in progress');
    expect(body.assetId).toBeUndefined();
  });

  it('returns preparing status when renditions are not ready', async () => {
    mockUpload.mockResolvedValue({ asset_id: 'asset-id' } as any);
    mockAsset.mockResolvedValue({
      static_renditions: { status: 'preparing' },
      playback_ids: [{ id: 'pb-id' }],
    } as any);

    const res = await getMuxAssetHandler('upload-id');
    const body = await res.json();

    expect(body.status).toBe('preparing');
    expect(body.message).toBe('Video processing in progress');
    expect(body.assetId).toBe('asset-id');
  });

  it('returns preparing when static_renditions is undefined', async () => {
    mockUpload.mockResolvedValue({ asset_id: 'asset-id' } as any);
    mockAsset.mockResolvedValue({ static_renditions: undefined } as any);

    const res = await getMuxAssetHandler('upload-id');
    const body = await res.json();

    expect(body.status).toBe('preparing');
  });

  it('returns playbackUrl and downloadUrl when renditions are ready', async () => {
    mockUpload.mockResolvedValue({ asset_id: 'asset-id' } as any);
    mockAsset.mockResolvedValue({
      static_renditions: { status: 'ready' },
      playback_ids: [{ id: 'pb-abc' }],
    } as any);

    const res = await getMuxAssetHandler('upload-id');
    const body = await res.json();

    expect(body.status).toBe('ready');
    expect(body.playbackUrl).toBe('https://stream.mux.com/pb-abc.m3u8');
    expect(body.downloadUrl).toBe('https://stream.mux.com/pb-abc/highest.mp4');
    expect(body.assetId).toBe('asset-id');
  });

  it('returns null URLs when no playback_ids even if renditions ready', async () => {
    mockUpload.mockResolvedValue({ asset_id: 'asset-id' } as any);
    mockAsset.mockResolvedValue({
      static_renditions: { status: 'ready' },
      playback_ids: [],
    } as any);

    const res = await getMuxAssetHandler('upload-id');
    const body = await res.json();

    expect(body.playbackUrl).toBeNull();
    expect(body.downloadUrl).toBeNull();
  });

  it('returns ready when status is absent but highest.mp4 file is ready', async () => {
    mockUpload.mockResolvedValue({ asset_id: 'asset-id' } as any);
    mockAsset.mockResolvedValue({
      static_renditions: {
        files: [{ name: 'highest.mp4', status: 'ready' }],
      },
      playback_ids: [{ id: 'pb-abc' }],
    } as any);

    const res = await getMuxAssetHandler('upload-id');
    const body = await res.json();

    expect(body.status).toBe('ready');
    expect(body.playbackUrl).toBe('https://stream.mux.com/pb-abc.m3u8');
    expect(body.downloadUrl).toBe('https://stream.mux.com/pb-abc/highest.mp4');
  });

  it('returns preparing when status is absent and highest.mp4 is not ready', async () => {
    mockUpload.mockResolvedValue({ asset_id: 'asset-id' } as any);
    mockAsset.mockResolvedValue({
      static_renditions: {
        files: [{ name: 'highest.mp4', status: 'preparing' }],
      },
      playback_ids: [{ id: 'pb-abc' }],
    } as any);

    const res = await getMuxAssetHandler('upload-id');
    const body = await res.json();

    expect(body.status).toBe('preparing');
    expect(body.message).toBe('Video processing in progress');
  });
});
