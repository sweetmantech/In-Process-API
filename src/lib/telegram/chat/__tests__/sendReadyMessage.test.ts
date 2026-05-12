import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import sendReadyMessage from '../sendReadyMessage';

vi.mock('@/lib/moment/getMomentSuccessMessage', () => ({
  default: vi.fn(
    (contractAddress: string, tokenId: string) =>
      `Moment created, ready for editing at https://inprocess.world/sms/base:${contractAddress}/${tokenId}`
  ),
}));

vi.mock('@/lib/telegram/pollUntilOgReady', () => ({ default: vi.fn() }));

const makeThread = () => ({
  post: vi.fn().mockResolvedValue(undefined),
});

beforeEach(() => {
  vi.clearAllMocks();
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('sendReadyMessage', () => {
  it('posts the success message', async () => {
    const thread = makeThread();

    const promise = sendReadyMessage(thread as never, '0xContract', '42');
    await vi.runAllTimersAsync();
    await promise;

    expect(thread.post).toHaveBeenCalledWith(
      'Moment created, ready for editing at https://inprocess.world/sms/base:0xContract/42'
    );
  });
});
