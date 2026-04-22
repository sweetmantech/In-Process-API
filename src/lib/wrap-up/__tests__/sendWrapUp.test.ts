import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/telegram/client', () => ({
  telegramChatBotClient: { sendMessage: vi.fn().mockResolvedValue(undefined) },
}));
vi.mock('@/lib/consts', () => ({
  WRAP_UP_CHANNEL_LABELS: {
    telegram: '📱 Telegram',
    web: '🌐 Web',
    api: '🔌 API',
    sms: '💬 SMS',
  },
}));

import { telegramChatBotClient } from '@/lib/telegram/client';
import sendWrapUp from '../sendWrapUp';

const BASE = {
  chatId: '849865010',
  username: 'cxy',
  telegramCount: 0,
  webCount: 0,
  apiCount: 0,
  smsCount: 0,
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('sendWrapUp', () => {
  it('sends to the correct chatId', async () => {
    await sendWrapUp({ ...BASE, telegramCount: 3 });

    expect(telegramChatBotClient.sendMessage).toHaveBeenCalledWith(
      BASE.chatId,
      expect.any(String)
    );
  });

  it('includes the username in the message', async () => {
    await sendWrapUp({ ...BASE, telegramCount: 3 });

    expect(telegramChatBotClient.sendMessage).toHaveBeenCalledWith(
      expect.any(String),
      expect.stringContaining('@cxy')
    );
  });

  it('uses singular "moment" when total is 1', async () => {
    await sendWrapUp({ ...BASE, telegramCount: 1 });

    expect(telegramChatBotClient.sendMessage).toHaveBeenCalledWith(
      expect.any(String),
      expect.stringContaining('1 moment this week')
    );
  });

  it('uses plural "moments" when total is more than 1', async () => {
    await sendWrapUp({ ...BASE, telegramCount: 4, webCount: 2 });

    expect(telegramChatBotClient.sendMessage).toHaveBeenCalledWith(
      expect.any(String),
      expect.stringContaining('6 moments this week')
    );
  });

  it('only shows channels with a non-zero count in the breakdown', async () => {
    await sendWrapUp({ ...BASE, telegramCount: 7, webCount: 0, apiCount: 2 });

    const text = vi.mocked(telegramChatBotClient.sendMessage).mock
      .calls[0][1] as string;
    expect(text).toContain('📱 Telegram: 7');
    expect(text).toContain('🔌 API: 2');
    expect(text).not.toContain('🌐 Web');
    expect(text).not.toContain('💬 SMS');
  });

  it('includes the breakdown header and closing message', async () => {
    await sendWrapUp({ ...BASE, telegramCount: 1 });

    const text = vi.mocked(telegramChatBotClient.sendMessage).mock
      .calls[0][1] as string;
    expect(text).toContain('📊');
    expect(text).toContain('See you next Friday');
  });
});
