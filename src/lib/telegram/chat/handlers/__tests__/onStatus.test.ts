import { describe, it, expect, vi } from 'vitest';
import { registerOnStatus } from '../onStatus';

function makeBot() {
  let pattern: RegExp | undefined;
  let handler: ((thread: any) => Promise<void>) | undefined;
  return {
    onNewMessage: vi.fn((p: any, cb: any) => { pattern = p; handler = cb; }),
    triggerMessage: (thread: any) => handler!(thread),
    getPattern: () => pattern,
  };
}

function makeThread() {
  return { post: vi.fn() };
}

describe('registerOnStatus', () => {
  it('registers a handler for the /status pattern', () => {
    const bot = makeBot();
    registerOnStatus(bot as any);
    expect(bot.onNewMessage).toHaveBeenCalledOnce();
    expect(bot.getPattern()).toEqual(/^\/status$/);
  });

  it('posts the running status message', async () => {
    const bot = makeBot();
    const thread = makeThread();
    registerOnStatus(bot as any);

    await bot.triggerMessage(thread);

    expect(thread.post).toHaveBeenCalledWith('✅ In-Process Bot is running.');
  });

  it('does not throw when thread.post rejects — swallows the error', async () => {
    const bot = makeBot();
    const thread = { post: vi.fn().mockRejectedValue(new Error('network')) };
    registerOnStatus(bot as any);

    await expect(bot.triggerMessage(thread)).resolves.toBeUndefined();
  });
});
