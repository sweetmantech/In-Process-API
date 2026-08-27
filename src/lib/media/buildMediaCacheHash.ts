import { createHash } from 'crypto';

const buildMediaCacheHash = (parts: Array<string | number | undefined>) => {
  const fingerprint = parts.map((part) => part ?? '').join('|');
  return createHash('sha256').update(fingerprint).digest('hex');
};

export default buildMediaCacheHash;
