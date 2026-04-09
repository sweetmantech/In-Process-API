import { describe, it, expect, vi, afterEach } from 'vitest';
import { getValidNonces } from '@/lib/farcaster/getValidNonces';

const NONCE_WINDOW_MS = 60 * 60 * 1000;

describe('getValidNonces', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns two nonce strings', () => {
    const nonces = getValidNonces();
    expect(nonces).toHaveLength(2);
    expect(nonces.every((n) => typeof n === 'string')).toBe(true);
  });

  it('returns current window and previous window nonces', () => {
    const now = 1_700_000_000_000;
    vi.setSystemTime(now);

    const current = Math.floor(now / NONCE_WINDOW_MS);
    const nonces = getValidNonces();

    expect(nonces).toEqual([current.toString(), (current - 1).toString()]);
  });

  it('changes at window boundaries', () => {
    const t1 = 1_700_000_000_000;
    const t2 = t1 + NONCE_WINDOW_MS;

    vi.setSystemTime(t1);
    const nonces1 = getValidNonces();

    vi.setSystemTime(t2);
    const nonces2 = getValidNonces();

    expect(nonces1[0]).not.toBe(nonces2[0]);
  });
});
