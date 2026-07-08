import type { Address } from 'viem';
import { acquireLock, releaseLock } from '@/lib/redis/acquireLock';

// A bit more than sendUserOperation's own 60s internal wait, so the lock
// outlives a normal mint and only expires early as a crash safety net.
const LOCK_TTL_MS = 90_000;
const MAX_WAIT_MS = 120_000;

/**
 * Serializes UserOperations per smart wallet so concurrent mints (e.g. a
 * Telegram burst split into multiple groups) never race the same nonce.
 */
export async function withSmartWalletMintLock<T>(
  walletAddress: Address,
  fn: () => Promise<T>
): Promise<T> {
  const lock = await acquireLock(
    `smart-wallet-mint-lock:${walletAddress.toLowerCase()}`,
    LOCK_TTL_MS,
    MAX_WAIT_MS
  );
  try {
    return await fn();
  } finally {
    await releaseLock(lock);
  }
}
