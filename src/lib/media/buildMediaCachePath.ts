import { MEDIA_CACHE_PREFIX } from '@/lib/media/mediaCacheConsts';

const buildMediaCachePath = (hash: string, extension: string) =>
  `${MEDIA_CACHE_PREFIX}/${hash}.${extension}`;

export default buildMediaCachePath;
