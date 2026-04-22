import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/telegram/chat/bot', () => {
  const post = vi.fn().mockResolvedValue(undefined);
  const channel = vi.fn().mockReturnValue({ post });
  return { default: { channel } };
});
vi.mock('@/lib/messages/logMessage', () => ({ logMessage: vi.fn() }));

import telegramChatBot from '@/lib/telegram/chat/bot';
import { logMessage } from '@/lib/messages/logMessage';
import sendNudge from '../sendNudge';

const CHAT_ID = 'telegram:123';
const ARTIST_ADDRESS = '0xArtist';

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(logMessage).mockResolvedValue('msg-id' as never);
});

describe('sendNudge', () => {
  it('posts the nudge to the correct chat with singular "day" for 1 day', async () => {
    await sendNudge({
      chatId: CHAT_ID,
      artistAddress: ARTIST_ADDRESS,
      daysSinceLastMoment: 1,
    });

    expect(telegramChatBot.channel).toHaveBeenCalledWith(CHAT_ID);
    const { post } = vi.mocked(telegramChatBot.channel).mock.results[0].value;
    expect(post).toHaveBeenCalledWith(expect.stringContaining('1 day since'));
  });

  it('uses plural "days" for more than 1 day', async () => {
    await sendNudge({
      chatId: CHAT_ID,
      artistAddress: ARTIST_ADDRESS,
      daysSinceLastMoment: 3,
    });

    const { post } = vi.mocked(telegramChatBot.channel).mock.results[0].value;
    expect(post).toHaveBeenCalledWith(expect.stringContaining('3 days since'));
  });

  it('includes the call-to-action text', async () => {
    await sendNudge({
      chatId: CHAT_ID,
      artistAddress: ARTIST_ADDRESS,
      daysSinceLastMoment: 5,
    });

    const { post } = vi.mocked(telegramChatBot.channel).mock.results[0].value;
    expect(post).toHaveBeenCalledWith(expect.stringContaining('In Process'));
    expect(post).toHaveBeenCalledWith(expect.stringContaining('cooking'));
  });

  it('logs the message as an assistant telegram message', async () => {
    await sendNudge({
      chatId: CHAT_ID,
      artistAddress: ARTIST_ADDRESS,
      daysSinceLastMoment: 5,
    });

    expect(logMessage).toHaveBeenCalledWith(
      expect.arrayContaining([expect.objectContaining({ type: 'text' })]),
      'assistant',
      CHAT_ID,
      ARTIST_ADDRESS,
      'telegram'
    );
  });
});
