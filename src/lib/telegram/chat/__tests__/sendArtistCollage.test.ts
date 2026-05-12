import { describe, it, expect, vi, beforeEach } from 'vitest';
import sendArtistCollage from '../sendArtistCollage';

vi.mock('@/lib/telegram/pollArtistCollage', () => ({ default: vi.fn() }));
vi.mock('@/lib/telegram/parseTelegramChatId', () => ({ default: vi.fn() }));

import pollArtistCollage from '@/lib/telegram/pollArtistCollage';
import parseTelegramChatId from '@/lib/telegram/parseTelegramChatId';

const ARTIST = '0x0000000000000000000000000000000000000123';

const makeThread = () => ({
  channelId: 'telegram:1352384640',
  adapter: {
    telegramFetch: vi.fn().mockResolvedValue(undefined),
  },
});

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(parseTelegramChatId).mockReturnValue('1352384640');
});

describe('sendArtistCollage', () => {
  it('does not call Telegram when collage polling returns null', async () => {
    vi.mocked(pollArtistCollage).mockResolvedValue(null);
    const thread = makeThread();

    await sendArtistCollage(thread as never, ARTIST);

    expect(thread.adapter.telegramFetch).not.toHaveBeenCalled();
  });

  it('sendPhoto with chat_id, PNG blob, and profile caption', async () => {
    const pngBytes = Buffer.from([0x89, 0x50, 0x4e, 0x47]);
    vi.mocked(pollArtistCollage).mockResolvedValue(pngBytes);
    const thread = makeThread();

    await sendArtistCollage(thread as never, ARTIST);

    expect(parseTelegramChatId).toHaveBeenCalledWith(thread.channelId);
    expect(thread.adapter.telegramFetch).toHaveBeenCalledWith(
      'sendPhoto',
      expect.any(FormData)
    );
    const form = vi.mocked(thread.adapter.telegramFetch).mock
      .calls[0][1] as FormData;
    expect(form.get('chat_id')).toBe('1352384640');
    expect(form.get('caption')).toBe(
      `See your latest moments at https://inprocess.world/${ARTIST}`
    );
    const photo = form.get('photo');
    expect(photo).toBeInstanceOf(Blob);
    expect((photo as Blob).type).toBe('image/png');
  });
});
