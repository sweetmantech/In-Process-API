import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/supabase/in_process_media_cache/selectExpiredMediaCache', () => ({
  default: vi.fn(),
}));
vi.mock('@/lib/supabase/in_process_media_cache/deleteMediaCacheByHashes', () => ({
  default: vi.fn(),
}));
vi.mock('@/lib/media/removeSupabaseStoragePaths', () => ({
  default: vi.fn(),
}));

import cleanupExpiredMediaCache from '@/lib/media/cleanupExpiredMediaCache';
import selectExpiredMediaCache from '@/lib/supabase/in_process_media_cache/selectExpiredMediaCache';
import deleteMediaCacheByHashes from '@/lib/supabase/in_process_media_cache/deleteMediaCacheByHashes';
import removeSupabaseStoragePaths from '@/lib/media/removeSupabaseStoragePaths';

describe('cleanupExpiredMediaCache', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deletes storage files and DB rows for expired cache entries', async () => {
    vi.mocked(selectExpiredMediaCache).mockResolvedValue([
      {
        hash: 'aaa',
        path: 'media-cache/aaa.webp',
        created_at: '2026-07-20T00:00:00.000Z',
      },
    ]);
    vi.mocked(removeSupabaseStoragePaths).mockResolvedValue(1);
    vi.mocked(deleteMediaCacheByHashes).mockResolvedValue(undefined);

    const result = await cleanupExpiredMediaCache(new Date('2026-08-27T12:00:00.000Z'));

    expect(selectExpiredMediaCache).toHaveBeenCalled();
    expect(removeSupabaseStoragePaths).toHaveBeenCalledWith(['media-cache/aaa.webp']);
    expect(deleteMediaCacheByHashes).toHaveBeenCalledWith(['aaa']);
    expect(result.deletedFiles).toBe(1);
    expect(result.expiredFiles).toEqual(['media-cache/aaa.webp']);
  });
});
