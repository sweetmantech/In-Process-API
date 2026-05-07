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

import selectAccountNotification from '@/lib/supabase/account_notifications/selectAccountNotification';
import upsertAccountNotification from '@/lib/supabase/account_notifications/upsertAccountNotification';
import handleNotify from '../handleNotify';

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

describe('handleNotify', () => {
  it('enables notifications when currently disabled', async () => {
    vi.mocked(selectAccountNotification).mockResolvedValue({
      data: { notify_enabled: false },
      error: null,
    } as never);

    await handleNotify(makeThread() as never, ARTIST_ADDRESS);

    expect(upsertAccountNotification).toHaveBeenCalledWith(
      expect.objectContaining({ notify_enabled: true })
    );
  });

  it('disables notifications when currently enabled', async () => {
    vi.mocked(selectAccountNotification).mockResolvedValue({
      data: { notify_enabled: true },
      error: null,
    } as never);

    await handleNotify(makeThread() as never, ARTIST_ADDRESS);

    expect(upsertAccountNotification).toHaveBeenCalledWith(
      expect.objectContaining({ notify_enabled: false })
    );
  });

  it('posts an "ON" message when enabling', async () => {
    vi.mocked(selectAccountNotification).mockResolvedValue({
      data: { notify_enabled: false },
      error: null,
    } as never);
    const thread = makeThread();

    await handleNotify(thread as never, ARTIST_ADDRESS);

    const message: string = thread.post.mock.calls[0][0];
    expect(message).toContain('ON');
  });

  it('posts an "OFF" message when disabling', async () => {
    vi.mocked(selectAccountNotification).mockResolvedValue({
      data: { notify_enabled: true },
      error: null,
    } as never);
    const thread = makeThread();

    await handleNotify(thread as never, ARTIST_ADDRESS);

    const message: string = thread.post.mock.calls[0][0];
    expect(message).toContain('OFF');
  });

  it('throws when upsert fails', async () => {
    vi.mocked(selectAccountNotification).mockResolvedValue({
      data: { notify_enabled: false },
      error: null,
    } as never);
    vi.mocked(upsertAccountNotification).mockResolvedValue({
      data: null,
      error: new Error('DB error'),
    } as never);

    await expect(
      handleNotify(makeThread() as never, ARTIST_ADDRESS)
    ).rejects.toThrow('DB error');
  });
});
