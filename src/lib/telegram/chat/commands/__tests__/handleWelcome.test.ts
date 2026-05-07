import { describe, it, expect, vi, beforeEach } from 'vitest';
import handleWelcome from '../handleWelcome';

const makeThread = () => ({
  post: vi.fn().mockResolvedValue(undefined),
});

beforeEach(() => {
  vi.clearAllMocks();
});

describe('handleWelcome', () => {
  it('posts the welcome message', async () => {
    const thread = makeThread();

    await handleWelcome(thread as never);

    expect(thread.post).toHaveBeenCalledOnce();
    const message: string = thread.post.mock.calls[0][0];
    expect(message).toContain('inprocess.world');
  });
});
