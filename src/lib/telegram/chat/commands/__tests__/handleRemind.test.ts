import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Address } from 'viem';

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

const ARTIST_ADDRESS = '0xArtist' as Address;

const makeThread = () => ({
  post: vi.fn().mockResolvedValue(undefined),
});

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(upsertAccountNotification).mockResolvedValue({
    data: null,
    error: null,
  } as never);
});

describe('handleRemind', () => {
  it('enables nudges when currently disabled (nudge_period is null)', async () => {
    vi.mocked(selectAccountNotification).mockResolvedValue({
      data: { nudge_period: null },
      error: null,
    } as never);

    await handleRemind(makeThread() as never, ARTIST_ADDRESS);

    expect(upsertAccountNotification).toHaveBeenCalledWith(
      expect.objectContaining({ nudge_period: 3 })
    );
  });

  it('disables nudges when currently enabled', async () => {
    vi.mocked(selectAccountNotification).mockResolvedValue({
      data: { nudge_period: 3 },
      error: null,
    } as never);

    await handleRemind(makeThread() as never, ARTIST_ADDRESS);

    expect(upsertAccountNotification).toHaveBeenCalledWith(
      expect.objectContaining({ nudge_period: null })
    );
  });

  it('posts an "ON" message when enabling nudges', async () => {
    vi.mocked(selectAccountNotification).mockResolvedValue({
      data: { nudge_period: null },
      error: null,
    } as never);
    const thread = makeThread();

    await handleRemind(thread as never, ARTIST_ADDRESS);

    const message: string = thread.post.mock.calls[0][0];
    expect(message).toContain('ON');
  });

  it('posts an "OFF" message when disabling nudges', async () => {
    vi.mocked(selectAccountNotification).mockResolvedValue({
      data: { nudge_period: 7 },
      error: null,
    } as never);
    const thread = makeThread();

    await handleRemind(thread as never, ARTIST_ADDRESS);

    const message: string = thread.post.mock.calls[0][0];
    expect(message).toContain('OFF');
  });

  it('throws when upsert fails', async () => {
    vi.mocked(selectAccountNotification).mockResolvedValue({
      data: { nudge_period: null },
      error: null,
    } as never);
    vi.mocked(upsertAccountNotification).mockResolvedValue({
      data: null,
      error: new Error('DB error'),
    } as never);

    await expect(
      handleRemind(makeThread() as never, ARTIST_ADDRESS)
    ).rejects.toThrow('DB error');
  });
});
