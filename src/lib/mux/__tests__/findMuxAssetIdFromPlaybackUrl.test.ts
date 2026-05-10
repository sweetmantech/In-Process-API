import { describe, it, expect, vi, beforeEach } from 'vitest';
import { findMuxAssetIdFromPlaybackUrl } from '../findMuxAssetIdFromPlaybackUrl';

vi.mock('@/lib/mux', () => ({
  default: {
    video: {
      playbackIds: { retrieve: vi.fn() },
    },
  },
}));

import mux from '@/lib/mux';

const mockRetrieve = vi.mocked(mux.video.playbackIds.retrieve);

beforeEach(() => {
  vi.clearAllMocks();
});

describe('findMuxAssetIdFromPlaybackUrl', () => {
  it('returns asset ID for a valid HLS URL', async () => {
    mockRetrieve.mockResolvedValue({
      object: { id: 'asset-xyz', type: 'asset' },
    } as any);

    const result = await findMuxAssetIdFromPlaybackUrl(
      'https://stream.mux.com/playback-abc.m3u8'
    );

    expect(mockRetrieve).toHaveBeenCalledWith('playback-abc');
    expect(result).toBe('asset-xyz');
  });

  it('returns null for a non-mux URL', async () => {
    const result = await findMuxAssetIdFromPlaybackUrl(
      'https://example.com/video.mp4'
    );
    expect(mockRetrieve).not.toHaveBeenCalled();
    expect(result).toBeNull();
  });

  it('returns null when object.id is missing', async () => {
    mockRetrieve.mockResolvedValue({ object: null } as any);

    const result = await findMuxAssetIdFromPlaybackUrl(
      'https://stream.mux.com/playback-abc.m3u8'
    );
    expect(result).toBeNull();
  });

  it('returns null when API throws', async () => {
    mockRetrieve.mockRejectedValue(new Error('Not found'));

    const result = await findMuxAssetIdFromPlaybackUrl(
      'https://stream.mux.com/playback-abc.m3u8'
    );
    expect(result).toBeNull();
  });
});
