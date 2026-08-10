import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/supabase/in_process_artists/selectArtists', () => ({
  default: vi.fn(),
}));
vi.mock(
  '@/lib/supabase/account_notifications/upsertAccountNotification',
  () => ({ default: vi.fn() })
);

import selectArtists from '@/lib/supabase/in_process_artists/selectArtists';
import upsertAccountNotification from '@/lib/supabase/account_notifications/upsertAccountNotification';
import { registerOnNudgePeriod } from '../onNudgePeriod';
import { NUDGE_PERIOD_ACTION_ID } from '@/lib/consts';

const ARTIST_ID = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';
const ARTIST_WALLET = '0xArtist';
const TELEGRAM_USERNAME = 'artist_user';

const makeBot = () => {
  const handler = { fn: (_event: unknown) => Promise.resolve() };
  const bot = {
    onAction: vi.fn((_, fn: (event: unknown) => Promise<void>) => {
      handler.fn = fn;
    }),
  };
  return { bot, handler };
};

const CHAT_ID = '1352384640';

const makeEvent = (
  value: string,
  userName: string | null = TELEGRAM_USERNAME
) => ({
  value,
  user: { userName: userName ?? undefined },
  thread: {
    post: vi.fn().mockResolvedValue(undefined),
    channelId: `telegram:${CHAT_ID}`,
  },
});

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(selectArtists).mockResolvedValue({
    data: [
      {
        id: ARTIST_ID,
        address: ARTIST_WALLET,
        wallets: [{ address: ARTIST_WALLET, type: 'external' }],
      },
    ],
    error: null,
  } as never);
  vi.mocked(upsertAccountNotification).mockResolvedValue({
    error: null,
  } as never);
});

describe('registerOnNudgePeriod', () => {
  it('registers the handler under NUDGE_PERIOD_ACTION_ID', () => {
    const { bot } = makeBot();
    registerOnNudgePeriod(bot as never);
    expect(bot.onAction).toHaveBeenCalledWith(
      NUDGE_PERIOD_ACTION_ID,
      expect.any(Function)
    );
  });

  describe.each([
    { value: '1', label: '1 day' },
    { value: '3', label: '3 days' },
    { value: '7', label: 'a week' },
  ])('when artist selects period $value', ({ value, label }) => {
    it(`upserts nudge_period to ${value}`, async () => {
      const { bot, handler } = makeBot();
      registerOnNudgePeriod(bot as never);
      await handler.fn(makeEvent(value));
      expect(upsertAccountNotification).toHaveBeenCalledWith({
        wallet: ARTIST_WALLET,
        telegram_chat_id: CHAT_ID,
        nudge_period: Number(value),
      });
    });

    it(`replies with the correct message for "${label}"`, async () => {
      const { bot, handler } = makeBot();
      registerOnNudgePeriod(bot as never);
      const event = makeEvent(value);
      await handler.fn(event);
      expect(event.thread.post).toHaveBeenCalledWith(
        expect.stringContaining(label)
      );
    });

    it('reply includes "haven\'t posted in"', async () => {
      const { bot, handler } = makeBot();
      registerOnNudgePeriod(bot as never);
      const event = makeEvent(value);
      await handler.fn(event);
      expect(event.thread.post).toHaveBeenCalledWith(
        expect.stringContaining("haven't posted in")
      );
    });
  });

  describe('early exits', () => {
    it('does nothing when value is not a valid period', async () => {
      const { bot, handler } = makeBot();
      registerOnNudgePeriod(bot as never);
      await handler.fn(makeEvent('5'));
      expect(upsertAccountNotification).not.toHaveBeenCalled();
    });

    it('does nothing when value is empty', async () => {
      const { bot, handler } = makeBot();
      registerOnNudgePeriod(bot as never);
      await handler.fn(makeEvent(''));
      expect(upsertAccountNotification).not.toHaveBeenCalled();
    });

    it('does nothing when userName is missing', async () => {
      const { bot, handler } = makeBot();
      registerOnNudgePeriod(bot as never);
      await handler.fn(makeEvent('1', null));
      expect(upsertAccountNotification).not.toHaveBeenCalled();
    });

    it('does nothing when artist is not found', async () => {
      vi.mocked(selectArtists).mockResolvedValue({
        data: [],
        error: null,
      } as never);
      const { bot, handler } = makeBot();
      registerOnNudgePeriod(bot as never);
      await handler.fn(makeEvent('1'));
      expect(upsertAccountNotification).not.toHaveBeenCalled();
    });
  });

  it('does nothing when thread channelId is missing', async () => {
    const { bot, handler } = makeBot();
    registerOnNudgePeriod(bot as never);
    await handler.fn({
      value: '1',
      user: { userName: TELEGRAM_USERNAME },
      thread: { post: vi.fn() },
    });
    expect(upsertAccountNotification).not.toHaveBeenCalled();
  });

  it('throws when upsertAccountNotification throws', async () => {
    vi.mocked(upsertAccountNotification).mockRejectedValue(
      new Error('db error')
    );
    const { bot, handler } = makeBot();
    registerOnNudgePeriod(bot as never);
    await expect(handler.fn(makeEvent('1'))).rejects.toThrow('db error');
  });

  it('does not throw when event.thread is null', async () => {
    const { bot, handler } = makeBot();
    registerOnNudgePeriod(bot as never);
    const event = { ...makeEvent('1'), thread: null };
    await expect(handler.fn(event)).resolves.not.toThrow();
    expect(upsertAccountNotification).not.toHaveBeenCalled();
  });
});
