import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/telegram/client', () => ({
  telegramChatBotClient: { sendMessage: vi.fn().mockResolvedValue(undefined) },
}));
vi.mock('@/lib/messages/logMessage', () => ({ logMessage: vi.fn() }));

import { telegramChatBotClient } from '@/lib/telegram/client';
import { logMessage } from '@/lib/messages/logMessage';
import sendNudge from '../sendNudge';

const CHAT_ID = 'telegram:123';
const ARTIST_ADDRESS = '0xArtist';

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(logMessage).mockResolvedValue('msg-id' as never);
});

describe('sendNudge', () => {
  it('sends to the correct chat with singular "day" for 1 day', async () => {
    await sendNudge({
      chatId: CHAT_ID,
      artistAddress: ARTIST_ADDRESS,
      daysSinceLastMoment: 1,
    });

    expect(telegramChatBotClient.sendMessage).toHaveBeenCalledWith(
      CHAT_ID,
      expect.stringContaining('1 day since')
    );
  });

  it('uses plural "days" for more than 1 day', async () => {
    await sendNudge({
      chatId: CHAT_ID,
      artistAddress: ARTIST_ADDRESS,
      daysSinceLastMoment: 3,
    });

    expect(telegramChatBotClient.sendMessage).toHaveBeenCalledWith(
      expect.any(String),
      expect.stringContaining('3 days since')
    );
  });

  it('includes the call-to-action text', async () => {
    await sendNudge({
      chatId: CHAT_ID,
      artistAddress: ARTIST_ADDRESS,
      daysSinceLastMoment: 5,
    });

    expect(telegramChatBotClient.sendMessage).toHaveBeenCalledWith(
      expect.any(String),
      expect.stringContaining('In Process')
    );
    expect(telegramChatBotClient.sendMessage).toHaveBeenCalledWith(
      expect.any(String),
      expect.stringContaining('cooking')
    );
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
