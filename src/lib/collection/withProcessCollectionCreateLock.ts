import type { Address } from 'viem';
import { acquireLock, releaseLock, renewLock } from '@/lib/redis/acquireLock';

// Crash safety net between heartbeats. Renewed while create+persist runs, because
// sendUserOperation can wait past waitForUserOperation's 60s for the receipt.
const LOCK_TTL_MS = 90_000;
const LOCK_RENEW_INTERVAL_MS = 30_000;
const MAX_WAIT_MS = 120_000;

/**
 * Serializes Process collection create per artist + chain so concurrent
 * requests cannot both pass the existence check and deploy duplicates.
 */
export async function withProcessCollectionCreateLock<T>(
  artistAddress: Address,
  chainId: number,
  fn: () => Promise<T>
): Promise<T> {
  const lock = await acquireLock(
    `process-collection-create:${artistAddress.toLowerCase()}:${chainId}`,
    LOCK_TTL_MS,
    MAX_WAIT_MS
  );
  const renewTimer = setInterval(() => {
    void renewLock(lock, LOCK_TTL_MS);
  }, LOCK_RENEW_INTERVAL_MS);
  try {
    return await fn();
  } finally {
    clearInterval(renewTimer);
    await releaseLock(lock);
  }
}
