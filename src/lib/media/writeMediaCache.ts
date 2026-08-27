import writeMediaCacheFile from '@/lib/media/writeMediaCacheFile';
import upsertMediaCache from '@/lib/supabase/in_process_media_cache/upsertMediaCache';

const writeMediaCache = async ({
  hash,
  path,
  kind,
  buffer,
  contentType,
}: {
  hash: string;
  path: string;
  kind: string;
  buffer: Buffer;
  contentType: string;
}): Promise<void> => {
  await writeMediaCacheFile(path, buffer, contentType);
  await upsertMediaCache({ hash, path, kind });
};

export default writeMediaCache;
