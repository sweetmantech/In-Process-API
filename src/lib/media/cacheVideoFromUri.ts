import fetchUri from '@/lib/arweave/fetchUri';
import writeMediaCache from '@/lib/media/writeMediaCache';
import resolveMediaCacheUrl from '@/lib/media/resolveMediaCacheUrl';
import { MAX_VIDEO_CACHE_BYTES } from '@/lib/media/mediaCacheConsts';

const cacheVideoFromUri = async ({
  uri,
  hash,
  path,
}: {
  uri: string;
  hash: string;
  path: string;
}): Promise<void> => {
  const cachedUrl = await resolveMediaCacheUrl(path);
  if (cachedUrl) return;

  const response = await fetchUri(uri, {
    headers: { 'Accept-Encoding': 'identity' },
  });

  if (!response.ok) return;

  const contentLengthHeader = response.headers.get('content-length');
  if (!contentLengthHeader) return;

  const contentLength = parseInt(contentLengthHeader, 10);
  if (
    !Number.isFinite(contentLength) ||
    contentLength <= 0 ||
    contentLength > MAX_VIDEO_CACHE_BYTES
  ) {
    return;
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  if (buffer.length > MAX_VIDEO_CACHE_BYTES) return;

  const contentType =
    response.headers.get('content-type') ?? 'application/octet-stream';

  await writeMediaCache({
    hash,
    path,
    kind: 'video',
    buffer,
    contentType,
  });
};

export default cacheVideoFromUri;
