import { describe, it, expect, vi, beforeEach } from 'vitest';
import { registerOnTextPostConfirmNo } from '../onTextPostConfirmNo';
import {
  TEXT_POST_CONFIRM_NO_ACTION_ID,
  TELEGRAM_TEXT_POST_CANCELLED_MESSAGE,
} from '@/lib/telegram/chat/consts';

vi.mock('@/lib/telegram/chat/moment/clearPendingTextBody', () => ({
  default: vi.fn(),
}));

import clearPendingTextBody from '@/lib/telegram/chat/moment/clearPendingTextBody';

const makeBot = () => {
  const handler = { fn: (_event: unknown) => Promise.resolve() };
  const bot = {
    onAction: vi.fn((_, fn: (event: unknown) => Promise<void>) => {
      handler.fn = fn;
    }),
  };
  return { bot, handler };
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(clearPendingTextBody).mockResolvedValue(undefined);
});

describe('registerOnTextPostConfirmNo', () => {
  it('registers under TEXT_POST_CONFIRM_NO_ACTION_ID', () => {
    const { bot } = makeBot();
    registerOnTextPostConfirmNo(bot as never);
    expect(bot.onAction).toHaveBeenCalledWith(
      TEXT_POST_CONFIRM_NO_ACTION_ID,
      expect.any(Function)
    );
  });

  it('clears pending text and posts cancelled', async () => {
    const { bot, handler } = makeBot();
    registerOnTextPostConfirmNo(bot as never);
    const post = vi.fn().mockResolvedValue(undefined);
    const thread = { post, channelId: 'telegram:1' };

    await handler.fn({ thread });

    expect(clearPendingTextBody).toHaveBeenCalledWith(thread);
    expect(post).toHaveBeenCalledWith(TELEGRAM_TEXT_POST_CANCELLED_MESSAGE);
  });
});
