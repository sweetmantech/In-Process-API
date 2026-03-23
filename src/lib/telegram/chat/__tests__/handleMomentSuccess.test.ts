import { describe, it, expect, vi, beforeEach } from 'vitest';
import handleMomentSuccess from '../handleMomentSuccess';

vi.mock('@trigger.dev/sdk', () => ({
  tasks: { trigger: vi.fn() },
}));
vi.mock('@/lib/messages/logMessage', () => ({ logMessage: vi.fn() }));
vi.mock('@/lib/consts', () => ({
  IS_TESTNET: false,
  SITE_ORIGINAL_URL: 'https://inprocess.world',
}));

import { tasks } from '@trigger.dev/sdk';
import { logMessage } from '@/lib/messages/logMessage';

const makeThread = () => ({
  post: vi.fn().mockResolvedValue(undefined),
});

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(logMessage).mockResolvedValue('msg-id-123' as never);
  vi.mocked(tasks.trigger).mockResolvedValue(undefined as never);
});

describe('handleMomentSuccess', () => {
  it('posts the success message with the base chain URL', async () => {
    const thread = makeThread();

    await handleMomentSuccess(thread as never, '0xContract', '42', '0xArtist');

    expect(thread.post).toHaveBeenCalledWith(
      '✅ Moment created! https://inprocess.world/sms/base:0xContract/42'
    );
  });

  it('logs the success message as assistant', async () => {
    const thread = makeThread();

    await handleMomentSuccess(thread as never, '0xContract', '42', '0xArtist');

    expect(logMessage).toHaveBeenCalledWith(
      [{ type: 'text', text: expect.stringContaining('0xContract') }],
      'assistant',
      '0xArtist',
      'telegram'
    );
  });

  it('triggers the process-message-moment task when messageId is returned', async () => {
    const thread = makeThread();

    await handleMomentSuccess(thread as never, '0xContract', '42', '0xArtist');

    expect(tasks.trigger).toHaveBeenCalledWith('process-message-moment', {
      messageId: 'msg-id-123',
    });
  });

  it('does not trigger a task when logMessage returns no messageId', async () => {
    const thread = makeThread();
    vi.mocked(logMessage).mockResolvedValue(undefined as never);

    await handleMomentSuccess(thread as never, '0xContract', '42', '0xArtist');

    expect(tasks.trigger).not.toHaveBeenCalled();
  });

  it('does not throw when tasks.trigger fails', async () => {
    const thread = makeThread();
    vi.mocked(tasks.trigger).mockRejectedValue(new Error('trigger failed'));

    await expect(
      handleMomentSuccess(thread as never, '0xContract', '42', '0xArtist')
    ).resolves.not.toThrow();
  });

  it('still posts the success message even when tasks.trigger fails', async () => {
    const thread = makeThread();
    vi.mocked(tasks.trigger).mockRejectedValue(new Error('trigger failed'));

    await handleMomentSuccess(thread as never, '0xContract', '42', '0xArtist');

    expect(thread.post).toHaveBeenCalledOnce();
  });
});
