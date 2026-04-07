import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import replyAfterSuccess from '../replyAfterSuccess';

vi.mock('@/lib/moment/getMomentSuccessMessage', () => ({
  default: vi.fn(
    (contractAddress: string, tokenId: string) =>
      `Moment created, ready for editing at https://inprocess.world/sms/base:${contractAddress}/${tokenId}`
  ),
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
  adapter: { telegramFetch: vi.fn().mockResolvedValue({}) },
});

beforeEach(() => {
  vi.clearAllMocks();
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
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
      'Moment created, ready for editing at https://inprocess.world/sms/base:0xContract/42'
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
    const [method, formData] = thread.adapter.telegramFetch.mock.calls[0] as [
      string,
      FormData,
    ];
    expect(method).toBe('sendPhoto');
    expect(formData.get('chat_id')).toBe('-100123456');
    expect(formData.get('caption')).toBe(
      `See your latest moments at https://inprocess.world/${ARTIST_ADDRESS}`
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
    expect(thread.adapter.telegramFetch).not.toHaveBeenCalled();
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
    expect(thread.adapter.telegramFetch).not.toHaveBeenCalled();
  });
});
