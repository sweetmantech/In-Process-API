import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Address } from 'viem';

vi.mock('@/lib/supabase/in_process_artists/upsertProfile', () => ({
  upsertProfile: vi.fn(),
}));
vi.mock('@/lib/messages/logMessage', () => ({ logMessage: vi.fn() }));

import { upsertProfile } from '@/lib/supabase/in_process_artists/upsertProfile';
import { logMessage } from '@/lib/messages/logMessage';
import handleRemind from '../handleRemind';

const ARTIST_ADDRESS = '0xArtist' as Address;
const ROOM_ID = 'telegram:7';

const makeThread = () => ({
  post: vi.fn().mockResolvedValue(undefined),
});

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(upsertProfile).mockResolvedValue({ error: null } as never);
  vi.mocked(logMessage).mockResolvedValue('msg-id' as never);
});

describe('handleRemind', () => {
  describe('when nudge_enabled is currently true', () => {
    it('updates nudge_enabled to false', async () => {
      await handleRemind(makeThread() as never, ROOM_ID, ARTIST_ADDRESS, true);
      expect(upsertProfile).toHaveBeenCalledWith(
        expect.objectContaining({
          address: ARTIST_ADDRESS,
          nudge_enabled: false,
        })
      );
    });

    it('posts the OFF confirmation with 🔕', async () => {
      const thread = makeThread();
      await handleRemind(thread as never, ROOM_ID, ARTIST_ADDRESS, true);
      expect(thread.post).toHaveBeenCalledWith(expect.stringContaining('🔕'));
    });

    it('tells user how to re-enable', async () => {
      const thread = makeThread();
      await handleRemind(thread as never, ROOM_ID, ARTIST_ADDRESS, true);
      expect(thread.post).toHaveBeenCalledWith(
        expect.stringContaining('/remind')
      );
    });
  });

  describe('when nudge_enabled is currently false', () => {
    it('updates nudge_enabled to true', async () => {
      await handleRemind(makeThread() as never, ROOM_ID, ARTIST_ADDRESS, false);
      expect(upsertProfile).toHaveBeenCalledWith(
        expect.objectContaining({
          address: ARTIST_ADDRESS,
          nudge_enabled: true,
        })
      );
    });

    it('posts the ON confirmation with 🔔', async () => {
      const thread = makeThread();
      await handleRemind(thread as never, ROOM_ID, ARTIST_ADDRESS, false);
      expect(thread.post).toHaveBeenCalledWith(expect.stringContaining('🔔'));
    });

    it('mentions the 3-day inactivity threshold in the ON confirmation', async () => {
      const thread = makeThread();
      await handleRemind(thread as never, ROOM_ID, ARTIST_ADDRESS, false);
      expect(thread.post).toHaveBeenCalledWith(expect.stringContaining('3'));
    });
  });

  it('logs the reply as an assistant telegram message', async () => {
    await handleRemind(makeThread() as never, ROOM_ID, ARTIST_ADDRESS, true);
    expect(logMessage).toHaveBeenCalledWith(
      expect.any(Array),
      'assistant',
      ROOM_ID,
      ARTIST_ADDRESS,
      'telegram'
    );
  });

  it('throws when upsertProfile returns an error', async () => {
    vi.mocked(upsertProfile).mockResolvedValue({
      error: new Error('db error'),
    } as never);

    await expect(
      handleRemind(makeThread() as never, ROOM_ID, ARTIST_ADDRESS, true)
    ).rejects.toThrow('db error');
  });
});
