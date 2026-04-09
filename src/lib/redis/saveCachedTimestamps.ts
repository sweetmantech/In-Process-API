import redisClient from './redisClient';
import { REDIS_TIMESTAMP_KEY } from '@/lib/consts';

const saveCachedTimestamps = async (
  timestamps: Record<string, number | null>
): Promise<void> => {
  await redisClient.set(REDIS_TIMESTAMP_KEY, JSON.stringify(timestamps));
};

export default saveCachedTimestamps;
