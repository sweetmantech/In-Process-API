import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Address } from 'viem';
import { registerOnTextPostConfirmYes } from '../onTextPostConfirmYes';
import {
  TEXT_POST_CONFIRM_YES_ACTION_ID,
  TELEGRAM_TEXT_POST_EXPIRED_MESSAGE,
} from '@/lib/telegram/chat/consts';

vi.mock('@/lib/telegram/chat/moment/getPendingTextBody', () => ({
  default: vi.fn(),
}));
vi.mock('@/lib/telegram/chat/moment/clearPendingTextBody', () => ({
  default: vi.fn(),
}));
vi.mock('@/lib/telegram/chat/moment/processTextMoment', () => ({
  default: vi.fn(),
}));
vi.mock('../getArtistByTelegram', () => ({ default: vi.fn() }));

import getPendingTextBody from '@/lib/telegram/chat/moment/getPendingTextBody';
import clearPendingTextBody from '@/lib/telegram/chat/moment/clearPendingTextBody';
import processTextMoment from '@/lib/telegram/chat/moment/processTextMoment';
import getArtistByTelegram from '../getArtistByTelegram';

const ARTIST_ADDRESS = '0xArtist' as Address;
const ARTIST = {
  artistId: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
  username: 'alice',
  primaryWallet: ARTIST_ADDRESS,
  wallets: [{ address: ARTIST_ADDRESS, type: 'external' as const }],
};

const makeBot = () => {
  const handler = { fn: (_event: unknown) => Promise.resolve() };
  const bot = {
    onAction: vi.fn((_, fn: (event: unknown) => Promise<void>) => {
      handler.fn = fn;
    }),
  };
  return { bot, handler };
};

const makeEvent = () => {
  const post = vi.fn().mockResolvedValue(undefined);
  return {
    user: { userName: 'testuser' },
    thread: { post, channelId: 'telegram:1' },
  };
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(getPendingTextBody).mockResolvedValue('body text');
  vi.mocked(clearPendingTextBody).mockResolvedValue(undefined);
  vi.mocked(getArtistByTelegram).mockResolvedValue(ARTIST as never);
  vi.mocked(processTextMoment).mockResolvedValue(undefined);
});

describe('registerOnTextPostConfirmYes', () => {
  it('registers under TEXT_POST_CONFIRM_YES_ACTION_ID', () => {
    const { bot } = makeBot();
    registerOnTextPostConfirmYes(bot as never);
    expect(bot.onAction).toHaveBeenCalledWith(
      TEXT_POST_CONFIRM_YES_ACTION_ID,
      expect.any(Function)
    );
  });

  it('clears pending text and mints a writing moment', async () => {
    const { bot, handler } = makeBot();
    registerOnTextPostConfirmYes(bot as never);
    const event = makeEvent();

    await handler.fn(event);

    expect(clearPendingTextBody).toHaveBeenCalledWith(event.thread);
    expect(processTextMoment).toHaveBeenCalledWith(
      event.thread,
      'body text',
      ARTIST
    );
  });

  it('posts an expired message when no pending body remains', async () => {
    vi.mocked(getPendingTextBody).mockResolvedValue(null);
    const { bot, handler } = makeBot();
    registerOnTextPostConfirmYes(bot as never);
    const event = makeEvent();

    await handler.fn(event);

    expect(processTextMoment).not.toHaveBeenCalled();
    expect(event.thread.post).toHaveBeenCalledWith(
      TELEGRAM_TEXT_POST_EXPIRED_MESSAGE
    );
  });
});
