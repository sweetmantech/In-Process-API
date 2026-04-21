import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/messages/logMessage', () => ({ logMessage: vi.fn() }));

import { logMessage } from '@/lib/messages/logMessage';
import handleWelcome from '../handleWelcome';

const ROOM_ID = 'telegram:99';

const makeThread = () => ({
  post: vi.fn().mockResolvedValue(undefined),
});

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(logMessage).mockResolvedValue('msg-id' as never);
});

describe('handleWelcome', () => {
  it('posts a message containing the manage link', async () => {
    const thread = makeThread();
    await handleWelcome(thread as never, ROOM_ID, 'hello');
    expect(thread.post).toHaveBeenCalledWith(
      expect.stringContaining('inprocess.world/manage')
    );
  });

  it('logs the original user message as role "user"', async () => {
    const thread = makeThread();
    await handleWelcome(thread as never, ROOM_ID, 'hello there');

    expect(logMessage).toHaveBeenCalledWith(
      [{ type: 'text', text: 'hello there' }],
      'user',
      ROOM_ID,
      undefined,
      'telegram'
    );
  });

  it('logs the welcome reply as role "assistant"', async () => {
    const thread = makeThread();
    await handleWelcome(thread as never, ROOM_ID, 'hello');

    expect(logMessage).toHaveBeenCalledWith(
      expect.any(Array),
      'assistant',
      ROOM_ID,
      undefined,
      'telegram'
    );
  });

  it('logs exactly twice (user + assistant)', async () => {
    const thread = makeThread();
    await handleWelcome(thread as never, ROOM_ID, 'hey');
    expect(logMessage).toHaveBeenCalledTimes(2);
  });
});
