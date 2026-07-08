import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('../redisClient', () => ({
  default: { set: vi.fn(), eval: vi.fn() },
}));

import { acquireLock, releaseLock } from '../acquireLock';
import redisClient from '../redisClient';

const mockSet = vi.mocked(redisClient.set);
const mockEval = vi.mocked(redisClient.eval);

beforeEach(() => {
  vi.clearAllMocks();
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('acquireLock', () => {
  it('acquires immediately when the key is free', async () => {
    mockSet.mockResolvedValue('OK' as never);

    const lock = await acquireLock('lock:a', 1000, 5000);

    expect(lock.key).toBe('lock:a');
    expect(typeof lock.token).toBe('string');
    expect(mockSet).toHaveBeenCalledWith('lock:a', lock.token, {
      condition: 'NX',
      expiration: { type: 'PX', value: 1000 },
    });
  });

  it('retries until the lock frees up, then acquires it', async () => {
    mockSet
      .mockResolvedValueOnce(null as never)
      .mockResolvedValueOnce(null as never)
      .mockResolvedValueOnce('OK' as never);

    const promise = acquireLock('lock:a', 1000, 5000);
    await vi.advanceTimersByTimeAsync(250);
    await vi.advanceTimersByTimeAsync(250);
    const lock = await promise;

    expect(mockSet).toHaveBeenCalledTimes(3);
    expect(lock.key).toBe('lock:a');
  });

  it('throws after maxWaitMs if the lock never frees up', async () => {
    mockSet.mockResolvedValue(null as never);

    const promise = acquireLock('lock:a', 1000, 1000);
    const assertion = expect(promise).rejects.toThrow(
      'Timed out waiting for lock: lock:a'
    );
    await vi.advanceTimersByTimeAsync(1000);
    await assertion;
  });
});

describe('releaseLock', () => {
  it('runs a check-and-delete script scoped to the lock key and token', async () => {
    mockEval.mockResolvedValue(1 as never);

    await releaseLock({ key: 'lock:a', token: 'tok-123' });

    expect(mockEval).toHaveBeenCalledWith(expect.stringContaining('del'), {
      keys: ['lock:a'],
      arguments: ['tok-123'],
    });
  });
});
