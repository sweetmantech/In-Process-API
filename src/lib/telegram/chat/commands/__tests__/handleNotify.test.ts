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
vi.mock('@/lib/messages/logMessage', () => ({ logMessage: vi.fn() }));

import selectAccountNotification from '@/lib/supabase/account_notifications/selectAccountNotification';
import upsertAccountNotification from '@/lib/supabase/account_notifications/upsertAccountNotification';
import { logMessage } from '@/lib/messages/logMessage';
import handleNotify from '../handleNotify';

const ARTIST_ADDRESS = '0xArtist' as Address;
const CHANNEL_ID = 'telegram:7';

const makeThread = () => ({
  post: vi.fn().mockResolvedValue(undefined),
  channelId: CHANNEL_ID,
});

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(selectAccountNotification).mockResolvedValue({
    data: { notify_enabled: false, nudge_enabled: false, nudge_period: 1 },
    error: null,
  } as never);
  vi.mocked(upsertAccountNotification).mockResolvedValue({
    error: null,
  } as never);
  vi.mocked(logMessage).mockResolvedValue('msg-id' as never);
});

describe('handleNotify', () => {
  describe('when notify_enabled is currently true', () => {
    beforeEach(() => {
      vi.mocked(selectAccountNotification).mockResolvedValue({
        data: { notify_enabled: true, nudge_enabled: false, nudge_period: 1 },
        error: null,
      } as never);
    });

    it('updates notify_enabled to false', async () => {
      await handleNotify(makeThread() as never, ARTIST_ADDRESS);
      expect(upsertAccountNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          artist_address: ARTIST_ADDRESS,
          notify_enabled: false,
        })
      );
    });

    it('posts the OFF confirmation with 🔕', async () => {
      const thread = makeThread();
      await handleNotify(thread as never, ARTIST_ADDRESS);
      expect(thread.post).toHaveBeenCalledWith(expect.stringContaining('🔕'));
    });

    it('tells user how to re-enable with /notify', async () => {
      const thread = makeThread();
      await handleNotify(thread as never, ARTIST_ADDRESS);
      expect(thread.post).toHaveBeenCalledWith(
        expect.stringContaining('/notify')
      );
    });
  });

  describe('when notify_enabled is currently false', () => {
    it('updates notify_enabled to true', async () => {
      await handleNotify(makeThread() as never, ARTIST_ADDRESS);
      expect(upsertAccountNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          artist_address: ARTIST_ADDRESS,
          notify_enabled: true,
        })
      );
    });

    it('posts the ON confirmation with 🔔', async () => {
      const thread = makeThread();
      await handleNotify(thread as never, ARTIST_ADDRESS);
      expect(thread.post).toHaveBeenCalledWith(expect.stringContaining('🔔'));
    });

    it('mentions airdrop in the ON confirmation', async () => {
      const thread = makeThread();
      await handleNotify(thread as never, ARTIST_ADDRESS);
      expect(thread.post).toHaveBeenCalledWith(
        expect.stringContaining('airdrop')
      );
    });
  });

  it('logs the reply as an assistant telegram message', async () => {
    await handleNotify(makeThread() as never, ARTIST_ADDRESS);
    expect(logMessage).toHaveBeenCalledWith(
      expect.any(Array),
      'assistant',
      CHANNEL_ID,
      ARTIST_ADDRESS,
      'telegram'
    );
  });

  it('throws when upsertAccountNotification returns an error', async () => {
    vi.mocked(upsertAccountNotification).mockResolvedValue({
      error: new Error('db error'),
    } as never);

    await expect(
      handleNotify(makeThread() as never, ARTIST_ADDRESS)
    ).rejects.toThrow('db error');
  });
});
