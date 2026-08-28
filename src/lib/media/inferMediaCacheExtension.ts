const MIME_TO_EXTENSION: Record<string, string> = {
  'video/mp4': 'mp4',
  'video/quicktime': 'mov',
  'video/webm': 'webm',
  'video/x-msvideo': 'avi',
  'video/x-matroska': 'mkv',
  'audio/mpeg': 'mp3',
  'audio/mp4': 'm4a',
  'audio/wav': 'wav',
  'audio/ogg': 'ogg',
  'image/jpeg': 'jpeg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/avif': 'avif',
  'image/gif': 'gif',
};

const URI_EXTENSION =
  /\.(mp4|mov|webm|avi|mkv|mp3|m4a|wav|ogg|jpeg|jpg|png|webp|avif|gif)(?:[?#]|$)/i;

const inferMediaCacheExtension = (
  uri: string,
  contentType?: string | null,
  fallback = 'bin'
): string => {
  if (contentType) {
    const normalized = contentType.split(';')[0]?.trim().toLowerCase();
    const fromMime = normalized ? MIME_TO_EXTENSION[normalized] : undefined;
    if (fromMime) return fromMime;
  }

  const match = uri.match(URI_EXTENSION);
  if (match) {
    const ext = match[1].toLowerCase();
    return ext === 'jpg' ? 'jpeg' : ext;
  }

  return fallback;
};

export default inferMediaCacheExtension;
