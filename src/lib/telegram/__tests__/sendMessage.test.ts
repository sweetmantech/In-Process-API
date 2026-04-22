import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/telegram/client', () => ({
  telegramFeedbackBotClient: { sendMessage: vi.fn().mockResolvedValue(undefined) },
}));
vi.mock('@/lib/consts', () => ({
  INPROCESS_GROUP_CHAT_ID: '-1002592953370',
}));

import { telegramFeedbackBotClient } from '@/lib/telegram/client';
import { sendMessage } from '../sendMessage';

const GROUP_CHAT_ID = '-1002592953370';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('sendMessage', () => {
  it('sends to the group chat ID', async () => {
    await sendMessage('hello');

    expect(telegramFeedbackBotClient.sendMessage).toHaveBeenCalledWith(
      GROUP_CHAT_ID,
      'hello',
      undefined
    );
  });

  it('trims messages that exceed the character limit', async () => {
    const longText = 'a'.repeat(5000);

    await sendMessage(longText);

    const sent = vi.mocked(telegramFeedbackBotClient.sendMessage).mock.calls[0][1] as string;
    expect(sent.length).toBeLessThan(5000);
    expect(sent).toContain('...[trimmed]');
  });

  it('passes through options to the underlying client', async () => {
    const options = { parse_mode: 'HTML' as const };

    await sendMessage('hi', options);

    expect(telegramFeedbackBotClient.sendMessage).toHaveBeenCalledWith(
      GROUP_CHAT_ID,
      'hi',
      options
    );
  });
});
