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

  it('returns master status when master is not ready', async () => {
    mockUpload.mockResolvedValue({ asset_id: 'asset-id' } as any);
    mockAsset.mockResolvedValue({
      master: { status: 'preparing' },
      status: 'preparing',
      playback_ids: [{ id: 'pb-id' }],
    } as any);

    const res = await getMuxAssetHandler('upload-id');
    const body = await res.json();

    expect(body.status).toBe('preparing');
    expect(body.message).toBe('Asset is being processed');
    expect(body.assetId).toBe('asset-id');
  });

  it('returns asset.status when master is undefined', async () => {
    mockUpload.mockResolvedValue({ asset_id: 'asset-id' } as any);
    mockAsset.mockResolvedValue({ status: 'preparing' } as any);

    const res = await getMuxAssetHandler('upload-id');
    const body = await res.json();

    expect(body.status).toBe('preparing');
  });

  it('returns playbackUrl and downloadUrl when asset is ready', async () => {
    mockUpload.mockResolvedValue({ asset_id: 'asset-id' } as any);
    mockAsset.mockResolvedValue({
      status: 'ready',
      playback_ids: [{ id: 'pb-abc' }],
    } as any);

    const res = await getMuxAssetHandler('upload-id');
    const body = await res.json();

    expect(body.status).toBe('ready');
    expect(body.playbackUrl).toBe('https://stream.mux.com/pb-abc.m3u8');
    expect(body.downloadUrl).toBe('https://stream.mux.com/pb-abc/highest.mp4');
    expect(body.assetId).toBe('asset-id');
  });

  it('returns null URLs when no playback_ids', async () => {
    mockUpload.mockResolvedValue({ asset_id: 'asset-id' } as any);
    mockAsset.mockResolvedValue({
      status: 'ready',
      playback_ids: [],
    } as any);

    const res = await getMuxAssetHandler('upload-id');
    const body = await res.json();

    expect(body.playbackUrl).toBeNull();
    expect(body.downloadUrl).toBeNull();
  });

  it('returns asset.status when master is ready', async () => {
    mockUpload.mockResolvedValue({ asset_id: 'asset-id' } as any);
    mockAsset.mockResolvedValue({
      master: { status: 'ready' },
      status: 'ready',
      playback_ids: [{ id: 'pb-abc' }],
    } as any);

    const res = await getMuxAssetHandler('upload-id');
    const body = await res.json();

    expect(body.status).toBe('ready');
    expect(body.playbackUrl).toBe('https://stream.mux.com/pb-abc.m3u8');
    expect(body.downloadUrl).toBe('https://stream.mux.com/pb-abc/highest.mp4');
  });

  it('throws when asset status is errored', async () => {
    mockUpload.mockResolvedValue({ asset_id: 'asset-id' } as any);
    mockAsset.mockResolvedValue({
      status: 'errored',
      playback_ids: [{ id: 'pb-abc' }],
    } as any);

    await expect(getMuxAssetHandler('upload-id')).rejects.toThrow(
      'Mux asset processing failed'
    );
  });
});
