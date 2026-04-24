import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Address } from 'viem';

vi.mock('@/lib/messages/logMessage', () => ({ logMessage: vi.fn() }));

import { logMessage } from '@/lib/messages/logMessage';
import handleStart from '../handleStart';

const ARTIST_ADDRESS = '0xArtist' as Address;
const ROOM_ID = 'telegram:42';

const makeThread = () => ({
  post: vi.fn().mockResolvedValue(undefined),
  channelId: ROOM_ID,
});

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(logMessage).mockResolvedValue('msg-id' as never);
});

describe('handleStart', () => {
  it('uses artistUsername in the greeting when it is set', async () => {
    const thread = makeThread();
    await handleStart(thread as never, ARTIST_ADDRESS, 'alice', 'tgalice');
    expect(thread.post).toHaveBeenCalledWith(expect.stringContaining('alice'));
  });

  it('falls back to telegramUsername when artistUsername is null', async () => {
    const thread = makeThread();
    await handleStart(thread as never, ARTIST_ADDRESS, null, 'tgalice');
    expect(thread.post).toHaveBeenCalledWith(
      expect.stringContaining('tgalice')
    );
  });

  it('logs the reply as an assistant telegram message', async () => {
    const thread = makeThread();
    await handleStart(thread as never, ARTIST_ADDRESS, 'alice', 'tgalice');

    expect(logMessage).toHaveBeenCalledWith(
      expect.any(Array),
      'assistant',
      ROOM_ID,
      ARTIST_ADDRESS,
      'telegram'
    );
  });

  it('mentions In Process in the message', async () => {
    const thread = makeThread();
    await handleStart(thread as never, ARTIST_ADDRESS, 'alice', 'tgalice');
    expect(thread.post).toHaveBeenCalledWith(
      expect.stringContaining('In Process')
    );
  });
});
