import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import replyAfterSuccess from '../replyAfterSuccess';

vi.mock('@/lib/consts', () => ({
  IS_TESTNET: false,
  SITE_ORIGINAL_URL: 'https://inprocess.world',
}));

vi.mock('@/lib/telegram/fetchArtistCollageBuffer', () => ({
  default: vi.fn(),
}));

import fetchArtistCollageBuffer from '@/lib/telegram/fetchArtistCollageBuffer';

const ARTIST_ADDRESS = '0xArtist';
const COLLAGE_BUFFER = Buffer.from('fake-image');

const makeThread = (channelId = '-100123456') => ({
  post: vi.fn().mockResolvedValue(undefined),
  channelId,
});

beforeEach(() => {
  vi.clearAllMocks();
  vi.useFakeTimers();
  vi.stubEnv('TELEGRAM_CHAT_BOT_TOKEN', 'test-token');
  global.fetch = vi.fn().mockResolvedValue({ ok: true });
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllEnvs();
});

describe('replyAfterSuccess', () => {
  it('posts the success message after the delay', async () => {
    vi.mocked(fetchArtistCollageBuffer).mockResolvedValue(null);
    const thread = makeThread();

    const promise = replyAfterSuccess(
      thread as never,
      '0xContract',
      '42',
      ARTIST_ADDRESS
    );
    await vi.runAllTimersAsync();
    await promise;

    expect(thread.post).toHaveBeenNthCalledWith(
      1,
      '✅ Moment created! https://inprocess.world/collect/base:0xContract/42'
    );
  });

  it('sends the collage as a photo via sendPhoto API when available', async () => {
    vi.mocked(fetchArtistCollageBuffer).mockResolvedValue(COLLAGE_BUFFER);
    const thread = makeThread('-100123456');

    const promise = replyAfterSuccess(
      thread as never,
      '0xContract',
      '42',
      ARTIST_ADDRESS
    );
    await vi.runAllTimersAsync();
    await promise;

    expect(thread.post).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.telegram.org/bottest-token/sendPhoto',
      expect.objectContaining({ method: 'POST' })
    );
  });

  it('does not call sendPhoto when collage is unavailable', async () => {
    vi.mocked(fetchArtistCollageBuffer).mockResolvedValue(null);
    const thread = makeThread();

    const promise = replyAfterSuccess(
      thread as never,
      '0xContract',
      '42',
      ARTIST_ADDRESS
    );
    await vi.runAllTimersAsync();
    await promise;

    expect(thread.post).toHaveBeenCalledOnce();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('skips collage fetch and posts only once when collageIncluded is false', async () => {
    vi.mocked(fetchArtistCollageBuffer).mockResolvedValue(COLLAGE_BUFFER);
    const thread = makeThread();

    const promise = replyAfterSuccess(
      thread as never,
      '0xContract',
      '42',
      ARTIST_ADDRESS,
      false
    );
    await vi.runAllTimersAsync();
    await promise;

    expect(fetchArtistCollageBuffer).not.toHaveBeenCalled();
    expect(thread.post).toHaveBeenCalledOnce();
    expect(global.fetch).not.toHaveBeenCalled();
  });
});
