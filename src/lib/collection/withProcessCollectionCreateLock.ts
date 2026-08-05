import type { Address } from 'viem';
import { acquireLock, releaseLock } from '@/lib/redis/acquireLock';

// Matches createCollection's sendUserOperation wait window (same as mint lock).
const LOCK_TTL_MS = 90_000;
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
  try {
    return await fn();
  } finally {
    await releaseLock(lock);
  }
}
