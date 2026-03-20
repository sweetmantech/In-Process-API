import { describe, it, expect, vi } from 'vitest';
import { registerOnHelp } from '../onHelp';

function makeBot() {
  let pattern: RegExp | undefined;
  let handler: ((thread: any) => Promise<void>) | undefined;
  return {
    onNewMessage: vi.fn((p: any, cb: any) => {
      pattern = p;
      handler = cb;
    }),
    triggerMessage: (thread: any) => handler!(thread),
    getPattern: () => pattern,
  };
}

function makeThread() {
  return { post: vi.fn() };
}

describe('registerOnHelp', () => {
  it('registers a handler for the /help pattern', () => {
    const bot = makeBot();
    registerOnHelp(bot as any);
    expect(bot.onNewMessage).toHaveBeenCalledOnce();
    expect(bot.getPattern()).toEqual(/^\/help$/);
  });

  it('posts the help message with all commands listed', async () => {
    const bot = makeBot();
    const thread = makeThread();
    registerOnHelp(bot as any);

    await bot.triggerMessage(thread);

    expect(thread.post).toHaveBeenCalledOnce();
    const message: string = thread.post.mock.calls[0][0];
    expect(message).toContain('/start');
    expect(message).toContain('/help');
    expect(message).toContain('/status');
    expect(message).toContain('@mention');
  });

  it('does not throw when thread.post rejects — swallows the error', async () => {
    const bot = makeBot();
    const thread = { post: vi.fn().mockRejectedValue(new Error('network')) };
    registerOnHelp(bot as any);

    await expect(bot.triggerMessage(thread)).resolves.toBeUndefined();
  });
});
