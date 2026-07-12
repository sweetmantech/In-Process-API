import { describe, it, expect, vi, beforeEach } from 'vitest';
import sendReadyMessage from '@/lib/telegram/chat/messaging/sendReadyMessage';

vi.mock('@/lib/consts', () => ({
  IS_TESTNET: false,
  SITE_ORIGINAL_URL: 'https://inprocess.world',
}));

const makeThread = () => ({ post: vi.fn().mockResolvedValue(undefined) });

beforeEach(() => {
  vi.clearAllMocks();
});

describe('sendReadyMessage', () => {
  it('posts a single-moment message when tokenIds is a string', async () => {
    const thread = makeThread();
    await sendReadyMessage(thread as never, '0xContract', '3');
    expect(thread.post).toHaveBeenCalledWith(
      'Moment created, ready for editing at https://inprocess.world/sms/base:0xContract/3'
    );
  });

  it('posts a grouped message when tokenIds is an array', async () => {
    const thread = makeThread();
    await sendReadyMessage(thread as never, '0xContract', ['1', '2', '3']);
    expect(thread.post).toHaveBeenCalledWith(
      'Moments created, ready for editing at:\n' +
        '#1: https://inprocess.world/sms/base:0xContract/1\n' +
        '#2: https://inprocess.world/sms/base:0xContract/2\n' +
        '#3: https://inprocess.world/sms/base:0xContract/3'
    );
  });

  it('posts exactly once regardless of token count', async () => {
    const thread = makeThread();
    await sendReadyMessage(thread as never, '0xContract', ['1', '2']);
    expect(thread.post).toHaveBeenCalledTimes(1);
  });
});
