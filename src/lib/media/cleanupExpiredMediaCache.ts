import { MEDIA_CACHE_TTL_DAYS } from '@/lib/media/mediaCacheConsts';
import removeSupabaseStoragePaths from '@/lib/media/removeSupabaseStoragePaths';
import selectMediaCache from '@/lib/supabase/in_process_media_cache/selectMediaCache';
import deleteMediaCache from '@/lib/supabase/in_process_media_cache/deleteMediaCache';

const CLEANUP_BATCH_LIMIT = 500;

const cleanupExpiredMediaCache = async (now: Date = new Date()) => {
  const cutoff = new Date(
    now.getTime() - MEDIA_CACHE_TTL_DAYS * 24 * 60 * 60 * 1000
  );
  const expiredRows = await selectMediaCache({
    createdBefore: cutoff,
    limit: CLEANUP_BATCH_LIMIT,
  });
  const expiredPaths = expiredRows.map((row) => row.path);
  const deletedFiles = await removeSupabaseStoragePaths(expiredPaths);
  await deleteMediaCache(expiredRows.map((row) => row.hash));

  return {
    scannedFiles: expiredRows.length,
    deletedFiles,
    expiredFiles: expiredRows.map((row) => row.path),
  };
};

export default cleanupExpiredMediaCache;
