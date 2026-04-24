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
import handleRemind from '../handleRemind';

const ARTIST_ADDRESS = '0xArtist' as Address;
const CHANNEL_ID = 'telegram:7';

const makeThread = () => ({
  post: vi.fn().mockResolvedValue(undefined),
  channelId: CHANNEL_ID,
});

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(selectAccountNotification).mockResolvedValue({
    data: { notify_enabled: false, nudge_period: null },
    error: null,
  } as never);
  vi.mocked(upsertAccountNotification).mockResolvedValue({
    error: null,
  } as never);
  vi.mocked(logMessage).mockResolvedValue('msg-id' as never);
});

describe('handleRemind', () => {
  describe('when nudge_period is currently set (nudge enabled)', () => {
    beforeEach(() => {
      vi.mocked(selectAccountNotification).mockResolvedValue({
        data: { notify_enabled: false, nudge_period: 1 },
        error: null,
      } as never);
    });

    it('sets nudge_period to null', async () => {
      await handleRemind(makeThread() as never, ARTIST_ADDRESS);
      expect(upsertAccountNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          artist_address: ARTIST_ADDRESS,
          nudge_period: null,
        })
      );
    });

    it('posts the OFF confirmation with 🔕', async () => {
      const thread = makeThread();
      await handleRemind(thread as never, ARTIST_ADDRESS);
      expect(thread.post).toHaveBeenCalledWith(expect.stringContaining('🔕'));
    });

    it('tells user how to re-enable', async () => {
      const thread = makeThread();
      await handleRemind(thread as never, ARTIST_ADDRESS);
      expect(thread.post).toHaveBeenCalledWith(
        expect.stringContaining('/remind')
      );
    });
  });

  describe('when nudge_period is null (nudge disabled)', () => {
    it('sets nudge_period to 3 (default)', async () => {
      await handleRemind(makeThread() as never, ARTIST_ADDRESS);
      expect(upsertAccountNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          artist_address: ARTIST_ADDRESS,
          nudge_period: 3,
        })
      );
    });

    it('posts a period selection card with 🔔 title and 3 buttons', async () => {
      const thread = makeThread();
      await handleRemind(thread as never, ARTIST_ADDRESS);
      expect(thread.post).toHaveBeenCalledTimes(1);
      const cardArg = thread.post.mock.calls[0]?.[0];
      expect(cardArg).toMatchObject({
        type: 'card',
        title: expect.stringContaining('🔔'),
        children: [
          {
            type: 'actions',
            children: expect.arrayContaining([
              expect.objectContaining({ type: 'button', value: '1' }),
              expect.objectContaining({ type: 'button', value: '3' }),
              expect.objectContaining({ type: 'button', value: '7' }),
            ]),
          },
        ],
      });
    });
  });

  it('logs the reply as an assistant telegram message', async () => {
    await handleRemind(makeThread() as never, ARTIST_ADDRESS);
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
      handleRemind(makeThread() as never, ARTIST_ADDRESS)
    ).rejects.toThrow('db error');
  });
});
