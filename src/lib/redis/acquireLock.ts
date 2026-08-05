import { randomUUID } from 'crypto';
import redisClient from './redisClient';

export interface Lock {
  key: string;
  token: string;
}

const POLL_INTERVAL_MS = 250;

export async function acquireLock(
  key: string,
  ttlMs: number,
  maxWaitMs: number
): Promise<Lock> {
  const token = randomUUID();
  const deadline = Date.now() + maxWaitMs;

  for (;;) {
    const acquired = await redisClient.set(key, token, {
      condition: 'NX',
      expiration: { type: 'PX', value: ttlMs },
    });
    if (acquired) return { key, token };

    if (Date.now() >= deadline) {
      throw new Error(`Timed out waiting for lock: ${key}`);
    }
    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
  }
}

export async function releaseLock(lock: Lock): Promise<void> {
  // Only delete if we still own it, so a lock we lost to TTL expiry
  // (and someone else has since acquired) is never deleted out from under them.
  await redisClient.eval(
    `if redis.call("get", KEYS[1]) == ARGV[1] then return redis.call("del", KEYS[1]) else return 0 end`,
    { keys: [lock.key], arguments: [lock.token] }
  );
}

export async function renewLock(lock: Lock, ttlMs: number): Promise<boolean> {
  const result = await redisClient.eval(
    `if redis.call("get", KEYS[1]) == ARGV[1] then return redis.call("pexpire", KEYS[1], ARGV[2]) else return 0 end`,
    { keys: [lock.key], arguments: [lock.token, String(ttlMs)] }
  );
  return Number(result) === 1;
}
