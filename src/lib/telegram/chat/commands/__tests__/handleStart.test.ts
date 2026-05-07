import { describe, it, expect, vi, beforeEach } from 'vitest';
import handleStart from '../handleStart';

const makeThread = () => ({
  post: vi.fn().mockResolvedValue(undefined),
  channelId: 'telegram:1352384640',
});

beforeEach(() => {
  vi.clearAllMocks();
});

describe('handleStart', () => {
  it('posts a welcome message using artistUsername when available', async () => {
    const thread = makeThread();

    await handleStart(thread as never, 'alice', 'tguser');

    expect(thread.post).toHaveBeenCalledOnce();
    const message: string = thread.post.mock.calls[0][0];
    expect(message).toContain('alice');
  });

  it('falls back to telegramUsername when artistUsername is null', async () => {
    const thread = makeThread();

    await handleStart(thread as never, null, 'tguser');

    const message: string = thread.post.mock.calls[0][0];
    expect(message).toContain('tguser');
  });
});
