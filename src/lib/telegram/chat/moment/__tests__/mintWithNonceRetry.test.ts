import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Address, Hash } from 'viem';

vi.mock('@/lib/moment/createMomentBatch', () => ({ default: vi.fn() }));

import createMomentBatch from '@/lib/moment/createMomentBatch';
import mintWithNonceRetry from '../mintWithNonceRetry';

const BATCH_INPUT = {
  contract: { name: 'My Album', uri: 'ar://collection-meta' },
  tokens: [],
  account: '0x0000000000000000000000000000000000000123' as Address,
  channel: 'telegram',
  chainId: 8453,
} as never;

const RESULT = {
  contractAddress: '0xC1' as Address,
  hash: '0xabc' as Hash,
  chainId: 8453,
  tokenIds: ['1'],
};

const makeThread = () => ({ post: vi.fn().mockResolvedValue(undefined) });

beforeEach(() => {
  vi.clearAllMocks();
  vi.useRealTimers();
});

describe('mintWithNonceRetry', () => {
  it('returns the result on the first try without posting anything', async () => {
    vi.mocked(createMomentBatch).mockResolvedValue(RESULT);
    const thread = makeThread();

    const result = await mintWithNonceRetry(thread as never, BATCH_INPUT);

    expect(result).toEqual(RESULT);
    expect(createMomentBatch).toHaveBeenCalledTimes(1);
    expect(thread.post).not.toHaveBeenCalled();
  });

  it('notifies the thread once and retries on a nonce error', async () => {
    vi.useFakeTimers();
    vi.mocked(createMomentBatch)
      .mockRejectedValueOnce(
        new Error('validation reverted: [reason]: AA25 invalid account nonce')
      )
      .mockResolvedValueOnce(RESULT);
    const thread = makeThread();

    const promise = mintWithNonceRetry(thread as never, BATCH_INPUT);
    await vi.runAllTimersAsync();
    const result = await promise;

    expect(result).toEqual(RESULT);
    expect(createMomentBatch).toHaveBeenCalledTimes(2);
    expect(thread.post).toHaveBeenCalledTimes(1);
    expect(thread.post).toHaveBeenCalledWith(expect.stringContaining('busy'));
  });

  it('retries up to MAX_ATTEMPTS total, notifying only once', async () => {
    vi.useFakeTimers();
    vi.mocked(createMomentBatch)
      .mockRejectedValueOnce(new Error('AA25 invalid account nonce'))
      .mockRejectedValueOnce(new Error('AA25 invalid account nonce'))
      .mockResolvedValueOnce(RESULT);
    const thread = makeThread();

    const promise = mintWithNonceRetry(thread as never, BATCH_INPUT);
    await vi.runAllTimersAsync();
    const result = await promise;

    expect(result).toEqual(RESULT);
    expect(createMomentBatch).toHaveBeenCalledTimes(3);
    expect(thread.post).toHaveBeenCalledTimes(1);
  });

  it('re-throws without retrying for a non-nonce error', async () => {
    vi.mocked(createMomentBatch).mockRejectedValue(
      new Error('insufficient funds for gas')
    );
    const thread = makeThread();

    await expect(
      mintWithNonceRetry(thread as never, BATCH_INPUT)
    ).rejects.toThrow('insufficient funds for gas');

    expect(createMomentBatch).toHaveBeenCalledTimes(1);
    expect(thread.post).not.toHaveBeenCalled();
  });

  it('propagates the error once MAX_ATTEMPTS is exhausted', async () => {
    vi.useFakeTimers();
    vi.mocked(createMomentBatch).mockRejectedValue(
      new Error('AA25 invalid account nonce')
    );
    const thread = makeThread();

    const promise = mintWithNonceRetry(thread as never, BATCH_INPUT);
    const expectation = expect(promise).rejects.toThrow(
      'AA25 invalid account nonce'
    );
    await vi.runAllTimersAsync();
    await expectation;

    expect(createMomentBatch).toHaveBeenCalledTimes(3);
    expect(thread.post).toHaveBeenCalledTimes(1);
  });
});
