import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/telegram/client', () => ({
  telegramFeedbackBotClient: {
    sendPhoto: vi.fn().mockResolvedValue(undefined),
  },
}));
vi.mock('@/lib/consts', () => ({
  INPROCESS_GROUP_CHAT_ID: '-1002592953370',
}));

import { telegramFeedbackBotClient } from '@/lib/telegram/client';
import { sendPhoto } from '../sendPhoto';

const GROUP_CHAT_ID = '-1002592953370';
const PHOTO_BUFFER = Buffer.from('fake-image');

beforeEach(() => {
  vi.clearAllMocks();
});

describe('sendPhoto', () => {
  it('sends to the group chat ID', async () => {
    await sendPhoto(PHOTO_BUFFER);

    expect(telegramFeedbackBotClient.sendPhoto).toHaveBeenCalledWith(
      GROUP_CHAT_ID,
      PHOTO_BUFFER,
      expect.any(Object)
    );
  });

  it('sends with HTML parse_mode by default', async () => {
    await sendPhoto(PHOTO_BUFFER);

    expect(telegramFeedbackBotClient.sendPhoto).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(Buffer),
      expect.objectContaining({ parse_mode: 'HTML' })
    );
  });

  it('includes the caption when provided', async () => {
    await sendPhoto(PHOTO_BUFFER, 'my caption');

    expect(telegramFeedbackBotClient.sendPhoto).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(Buffer),
      expect.objectContaining({ caption: 'my caption' })
    );
  });

  it('allows options to override defaults', async () => {
    await sendPhoto(PHOTO_BUFFER, 'cap', { parse_mode: 'MarkdownV2' });

    expect(telegramFeedbackBotClient.sendPhoto).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(Buffer),
      expect.objectContaining({ parse_mode: 'MarkdownV2' })
    );
  });
});
