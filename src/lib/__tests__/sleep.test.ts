import { describe, it, expect, vi } from 'vitest';
import sleep from '../sleep';

describe('sleep', () => {
  it('returns a Promise', () => {
    vi.useFakeTimers();
    const promise = sleep(100);
    expect(promise).toBeInstanceOf(Promise);
    vi.runAllTimers();
    vi.useRealTimers();
  });

  it('resolves after the given ms', async () => {
    vi.useFakeTimers();
    let resolved = false;
    const promise = sleep(500).then(() => {
      resolved = true;
    });
    expect(resolved).toBe(false);
    vi.advanceTimersByTime(500);
    await promise;
    expect(resolved).toBe(true);
    vi.useRealTimers();
  });
});
