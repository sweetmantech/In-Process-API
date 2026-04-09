import redisClient from './redisClient';
import { indexers } from '@/lib/indexer/indexers/indexers';

const KV_KEY = 'indexer:cached_timestamps';

const loadCachedTimestamps = async (): Promise<Record<
  string,
  number | null
> | null> => {
  const stored = await redisClient.get<Record<string, number | null>>(KV_KEY);
  if (!stored) return null;

  // Ensure all current indexers are represented (new indexers may have been added)
  const allPresent = indexers.every((i) => i.indexName in stored);
  if (!allPresent) return null;

  return stored;
};

export default loadCachedTimestamps;
