import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock(
  '@/lib/supabase/account_notifications/selectAccountNotification',
  () => ({
    default: vi.fn(),
  })
);
vi.mock(
  '@/lib/supabase/account_notifications/upsertAccountNotification',
  () => ({
    default: vi.fn(),
  })
);
vi.mock('@/lib/telegram/parseTelegramChatId', () => ({
  default: vi.fn(() => '1352384640'),
}));

import selectAccountNotification from '@/lib/supabase/account_notifications/selectAccountNotification';
import upsertAccountNotification from '@/lib/supabase/account_notifications/upsertAccountNotification';
import handleNotify from '../handleNotify';

const ARTIST_ID = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';
const CHAT_ID = '1352384640';

const makeThread = () => ({
  post: vi.fn().mockResolvedValue(undefined),
  channelId: `telegram:${CHAT_ID}`,
});

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(upsertAccountNotification).mockResolvedValue(undefined);
});

describe('handleNotify', () => {
  it('enables notifications when currently disabled', async () => {
    vi.mocked(selectAccountNotification).mockResolvedValue({
      notify_enabled: false,
    } as any);

    await handleNotify(makeThread() as never, ARTIST_ID);

    expect(selectAccountNotification).toHaveBeenCalledWith({
      telegram_chat_id: CHAT_ID,
    });
    expect(upsertAccountNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        notify_enabled: true,
        telegram_chat_id: CHAT_ID,
      })
    );
  });

  it('disables notifications when currently enabled', async () => {
    vi.mocked(selectAccountNotification).mockResolvedValue({
      notify_enabled: true,
    } as any);

    await handleNotify(makeThread() as never, ARTIST_ID);

    expect(upsertAccountNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        notify_enabled: false,
        telegram_chat_id: CHAT_ID,
      })
    );
  });

  it('posts an "ON" message when enabling', async () => {
    vi.mocked(selectAccountNotification).mockResolvedValue({
      notify_enabled: false,
    } as any);
    const thread = makeThread();

    await handleNotify(thread as never, ARTIST_ID);

    const message: string = thread.post.mock.calls[0][0];
    expect(message).toContain('ON');
  });

  it('posts an "OFF" message when disabling', async () => {
    vi.mocked(selectAccountNotification).mockResolvedValue({
      notify_enabled: true,
    } as any);
    const thread = makeThread();

    await handleNotify(thread as never, ARTIST_ID);

    const message: string = thread.post.mock.calls[0][0];
    expect(message).toContain('OFF');
  });

  it('propagates errors from upsertAccountNotification', async () => {
    vi.mocked(selectAccountNotification).mockResolvedValue({
      notify_enabled: false,
    } as any);
    vi.mocked(upsertAccountNotification).mockRejectedValue(
      new Error('DB error')
    );

    await expect(
      handleNotify(makeThread() as never, ARTIST_ID)
    ).rejects.toThrow('DB error');
  });
});
