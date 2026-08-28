/** How long derived media files stay in Storage/DB before cron cleanup. */
export const MEDIA_CACHE_TTL_DAYS = 30;

export const MEDIA_CACHE_PREFIX = 'media-cache';

/** Skip caching videos larger than this (Vercel memory / upload limits). */
export const MAX_VIDEO_CACHE_BYTES = 200 * 1024 * 1024;
