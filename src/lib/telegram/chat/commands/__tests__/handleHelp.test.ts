import { describe, it, expect, vi, beforeEach } from 'vitest';
import handleHelp from '../handleHelp';
import { TELEGRAM_HELP_MESSAGE } from '@/lib/telegram/chat/consts';

const makeThread = () => ({
  post: vi.fn().mockResolvedValue(undefined),
  channelId: 'telegram:1352384640',
});

beforeEach(() => {
  vi.clearAllMocks();
});

describe('handleHelp', () => {
  it('posts the help message listing all slash commands', async () => {
    const thread = makeThread();

    await handleHelp(thread as never);

    expect(thread.post).toHaveBeenCalledOnce();
    expect(thread.post).toHaveBeenCalledWith(TELEGRAM_HELP_MESSAGE);
    const message: string = thread.post.mock.calls[0][0];
    expect(message).toContain('/start');
    expect(message).toContain('/collections');
    expect(message).toContain('/remind');
    expect(message).toContain('/notify');
    expect(message).toContain('/me');
    expect(message).toContain('/help');
  });
});
