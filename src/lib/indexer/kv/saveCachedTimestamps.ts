import redisClient from './redisClient';

const KV_KEY = 'indexer:cached_timestamps';

const saveCachedTimestamps = async (
  timestamps: Record<string, number | null>
): Promise<void> => {
  await redisClient.set(KV_KEY, timestamps);
};

export default saveCachedTimestamps;
