import { describe, it, expect, vi, beforeEach } from 'vitest';
import sendNudge from '../sendNudge';

vi.mock('@/lib/telegram/client', () => ({
  telegramChatBotClient: { sendMessage: vi.fn() },
}));
vi.mock(
  '@/lib/supabase/account_notifications/upsertAccountNotification',
  () => ({
    default: vi.fn(),
  })
);

import { telegramChatBotClient } from '@/lib/telegram/client';
import upsertAccountNotification from '@/lib/supabase/account_notifications/upsertAccountNotification';

const PARAMS = {
  chatId: '1352384640',
  wallet: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
  daysSinceLastMoment: 5,
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(telegramChatBotClient.sendMessage).mockResolvedValue(
    undefined as never
  );
  vi.mocked(upsertAccountNotification).mockResolvedValue({
    data: null,
    error: null,
  } as never);
});

describe('sendNudge', () => {
  it('sends a nudge message via Telegram', async () => {
    await sendNudge(PARAMS);

    expect(telegramChatBotClient.sendMessage).toHaveBeenCalledWith(
      PARAMS.chatId,
      expect.stringContaining('5 days')
    );
  });

  it('uses singular "day" when daysSinceLastMoment is 1', async () => {
    await sendNudge({ ...PARAMS, daysSinceLastMoment: 1 });

    const message = vi.mocked(telegramChatBotClient.sendMessage).mock
      .calls[0][1];
    expect(message).toContain('1 day');
    expect(message).not.toContain('1 days');
  });

  it('updates last_nudge_sent_at after sending', async () => {
    await sendNudge(PARAMS);

    expect(upsertAccountNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        wallet: PARAMS.wallet,
        last_nudge_sent_at: expect.any(String),
      })
    );
  });
});
