import redisClient from './redisClient';
import { indexers } from '@/lib/indexer/indexers/indexers';
import { REDIS_TIMESTAMP_KEY } from '@/lib/consts';

const loadCachedTimestamps = async (): Promise<Record<
  string,
  number | null
> | null> => {
  const raw = await redisClient.get(REDIS_TIMESTAMP_KEY);
  if (!raw) return null;
  const stored: Record<string, number | null> = JSON.parse(raw);

  // Ensure all current indexers are represented (new indexers may have been added)
  const allPresent = indexers.every((i) => i.indexName in stored);
  if (!allPresent) return null;

  return stored;
};

export default loadCachedTimestamps;
