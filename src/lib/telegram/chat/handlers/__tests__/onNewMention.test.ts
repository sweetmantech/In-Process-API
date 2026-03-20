import { describe, it, expect, vi } from 'vitest';
import { registerOnNewMention } from '../onNewMention';

function makeBot() {
  let handler: ((thread: any, message: any) => Promise<void>) | undefined;
  return {
    onNewMention: vi.fn((cb: any) => {
      handler = cb;
    }),
    triggerMention: (thread: any, message: any) => handler!(thread, message),
  };
}

function makeThread() {
  return { post: vi.fn() };
}

describe('registerOnNewMention', () => {
  it('registers a handler on bot.onNewMention', () => {
    const bot = makeBot();
    registerOnNewMention(bot as any);
    expect(bot.onNewMention).toHaveBeenCalledOnce();
  });

  it('posts a greeting when message text is empty', async () => {
    const bot = makeBot();
    const thread = makeThread();
    registerOnNewMention(bot as any);

    await bot.triggerMention(thread, { text: '' });

    expect(thread.post).toHaveBeenCalledWith(
      '👋 Hello! I am In-Process Bot. How can I help you?'
    );
  });

  it('posts a greeting when message text is only a mention', async () => {
    const bot = makeBot();
    const thread = makeThread();
    registerOnNewMention(bot as any);

    await bot.triggerMention(thread, { text: '@mybot' });

    expect(thread.post).toHaveBeenCalledWith(
      '👋 Hello! I am In-Process Bot. How can I help you?'
    );
  });

  it('posts a greeting when text is null/undefined', async () => {
    const bot = makeBot();
    const thread = makeThread();
    registerOnNewMention(bot as any);

    await bot.triggerMention(thread, { text: undefined });

    expect(thread.post).toHaveBeenCalledWith(
      '👋 Hello! I am In-Process Bot. How can I help you?'
    );
  });

  it('echoes back the message text when content is present', async () => {
    const bot = makeBot();
    const thread = makeThread();
    registerOnNewMention(bot as any);

    await bot.triggerMention(thread, { text: '@mybot what is an NFT?' });

    expect(thread.post).toHaveBeenCalledWith(
      'Received: "@mybot what is an NFT?"'
    );
  });

  it('trims whitespace before evaluating text', async () => {
    const bot = makeBot();
    const thread = makeThread();
    registerOnNewMention(bot as any);

    await bot.triggerMention(thread, { text: '   ' });

    expect(thread.post).toHaveBeenCalledWith(
      '👋 Hello! I am In-Process Bot. How can I help you?'
    );
  });

  it('does not throw when thread.post rejects — swallows the error', async () => {
    const bot = makeBot();
    const thread = { post: vi.fn().mockRejectedValue(new Error('network')) };
    registerOnNewMention(bot as any);

    await expect(
      bot.triggerMention(thread, { text: 'hello' })
    ).resolves.toBeUndefined();
  });
});
