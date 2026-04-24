import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/messages/logMessage', () => ({ logMessage: vi.fn() }));

import { logMessage } from '@/lib/messages/logMessage';
import handleWelcome from '../handleWelcome';

const ROOM_ID = 'telegram:99';

const makeThread = () => ({
  post: vi.fn().mockResolvedValue(undefined),
  channelId: ROOM_ID,
});

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(logMessage).mockResolvedValue('msg-id' as never);
});

describe('handleWelcome', () => {
  it('posts a message containing the manage link', async () => {
    const thread = makeThread();
    await handleWelcome(thread as never);
    expect(thread.post).toHaveBeenCalledWith(
      expect.stringContaining('inprocess.world/manage')
    );
  });

  it('logs the welcome reply as role "assistant"', async () => {
    const thread = makeThread();
    await handleWelcome(thread as never);

    expect(logMessage).toHaveBeenCalledWith(
      expect.any(Array),
      'assistant',
      ROOM_ID,
      undefined,
      'telegram'
    );
  });

  it('logs exactly once (assistant only)', async () => {
    const thread = makeThread();
    await handleWelcome(thread as never);
    expect(logMessage).toHaveBeenCalledTimes(1);
  });
});
