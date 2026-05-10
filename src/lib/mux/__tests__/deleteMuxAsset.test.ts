import { describe, it, expect, vi, beforeEach } from 'vitest';
import { deleteMuxAsset } from '../deleteAsset';

vi.mock('@/lib/mux', () => ({
  default: {
    video: {
      assets: { delete: vi.fn() },
    },
  },
}));

import mux from '@/lib/mux';

const mockDelete = vi.mocked(mux.video.assets.delete);

beforeEach(() => {
  vi.clearAllMocks();
});

describe('deleteMuxAsset', () => {
  it('calls mux delete with the given asset ID', async () => {
    mockDelete.mockResolvedValue(undefined as any);

    await deleteMuxAsset('asset-123');

    expect(mockDelete).toHaveBeenCalledWith('asset-123');
  });

  it('does not throw when mux delete fails', async () => {
    mockDelete.mockRejectedValue(new Error('API error'));

    await expect(deleteMuxAsset('asset-123')).resolves.toBeUndefined();
  });
});
