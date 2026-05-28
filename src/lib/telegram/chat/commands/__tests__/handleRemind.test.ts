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
vi.mock('@/lib/consts', () => ({
  NUDGE_PERIOD_ACTION_ID: 'nudge_period',
  NUDGE_PERIODS: {
    '3': { buttonLabel: 'Every 3 days' },
    '7': { buttonLabel: 'Every 7 days' },
  },
}));
vi.mock('chat', () => ({
  Card: vi.fn(({ title }: { title: string }) => title),
  Actions: vi.fn(() => []),
  Button: vi.fn(() => ({})),
}));

import selectAccountNotification from '@/lib/supabase/account_notifications/selectAccountNotification';
import upsertAccountNotification from '@/lib/supabase/account_notifications/upsertAccountNotification';
import handleRemind from '../handleRemind';

const ARTIST_ID = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';

const makeThread = () => ({
  post: vi.fn().mockResolvedValue(undefined),
});

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(upsertAccountNotification).mockResolvedValue(undefined);
});

describe('handleRemind', () => {
  it('enables nudges when currently disabled (nudge_period is null)', async () => {
    vi.mocked(selectAccountNotification).mockResolvedValue({
      nudge_period: null,
    } as any);

    await handleRemind(makeThread() as never, ARTIST_ID);

    expect(upsertAccountNotification).toHaveBeenCalledWith(
      expect.objectContaining({ nudge_period: 3 })
    );
  });

  it('disables nudges when currently enabled', async () => {
    vi.mocked(selectAccountNotification).mockResolvedValue({
      nudge_period: 3,
    } as any);

    await handleRemind(makeThread() as never, ARTIST_ID);

    expect(upsertAccountNotification).toHaveBeenCalledWith(
      expect.objectContaining({ nudge_period: null })
    );
  });

  it('posts an "ON" message when enabling nudges', async () => {
    vi.mocked(selectAccountNotification).mockResolvedValue({
      nudge_period: null,
    } as any);
    const thread = makeThread();

    await handleRemind(thread as never, ARTIST_ID);

    const message: string = thread.post.mock.calls[0][0];
    expect(message).toContain('ON');
  });

  it('posts an "OFF" message when disabling nudges', async () => {
    vi.mocked(selectAccountNotification).mockResolvedValue({
      nudge_period: 7,
    } as any);
    const thread = makeThread();

    await handleRemind(thread as never, ARTIST_ID);

    const message: string = thread.post.mock.calls[0][0];
    expect(message).toContain('OFF');
  });

  it('propagates errors from upsertAccountNotification', async () => {
    vi.mocked(selectAccountNotification).mockResolvedValue({
      nudge_period: null,
    } as any);
    vi.mocked(upsertAccountNotification).mockRejectedValue(
      new Error('DB error')
    );

    await expect(
      handleRemind(makeThread() as never, ARTIST_ID)
    ).rejects.toThrow('DB error');
  });
});
