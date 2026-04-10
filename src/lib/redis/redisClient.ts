import { createClient } from 'redis';

const redisClient = await createClient({
  url: process.env.REDIS_URL,
}).connect();

export default redisClient;
