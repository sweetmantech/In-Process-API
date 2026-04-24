import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/supabase/in_process_artists/selectArtists', () => ({
  default: vi.fn(),
}));
vi.mock(
  '@/lib/supabase/account_notifications/upsertAccountNotification',
  () => ({ default: vi.fn() })
);
vi.mock('../../commands/handleRemind', () => ({
  NUDGE_PERIOD_ACTION_ID: 'remind_period',
}));

import selectArtists from '@/lib/supabase/in_process_artists/selectArtists';
import upsertAccountNotification from '@/lib/supabase/account_notifications/upsertAccountNotification';
import { registerOnNudgePeriod } from '../onNudgePeriod';
import { NUDGE_PERIOD_ACTION_ID } from '../../commands/handleRemind';

const ARTIST_ADDRESS = '0xArtist';
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

const makeEvent = (
  value: string,
  userName: string | null = TELEGRAM_USERNAME
) => ({
  value,
  user: { userName: userName ?? undefined },
  thread: { post: vi.fn().mockResolvedValue(undefined) },
});

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(selectArtists).mockResolvedValue({
    data: [{ address: ARTIST_ADDRESS }],
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
        artist_address: ARTIST_ADDRESS,
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

  it('throws when upsertAccountNotification returns an error', async () => {
    vi.mocked(upsertAccountNotification).mockResolvedValue({
      error: new Error('db error'),
    } as never);
    const { bot, handler } = makeBot();
    registerOnNudgePeriod(bot as never);
    await expect(handler.fn(makeEvent('1'))).rejects.toThrow('db error');
  });

  it('does not throw when event.thread is null', async () => {
    const { bot, handler } = makeBot();
    registerOnNudgePeriod(bot as never);
    const event = { ...makeEvent('1'), thread: null };
    await expect(handler.fn(event)).resolves.not.toThrow();
  });
});
