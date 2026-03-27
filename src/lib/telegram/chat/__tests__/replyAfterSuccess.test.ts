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

const makeThread = () => ({
  post: vi.fn().mockResolvedValue(undefined),
});

beforeEach(() => {
  vi.clearAllMocks();
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('replyAfterSuccess', () => {
  it('posts the success message immediately', async () => {
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

  it('posts the collage as a second message after the delay when available', async () => {
    vi.mocked(fetchArtistCollageBuffer).mockResolvedValue(COLLAGE_BUFFER);
    const thread = makeThread();

    const promise = replyAfterSuccess(
      thread as never,
      '0xContract',
      '42',
      ARTIST_ADDRESS
    );
    await vi.runAllTimersAsync();
    await promise;

    expect(thread.post).toHaveBeenCalledTimes(2);
    expect(thread.post).toHaveBeenNthCalledWith(2, {
      markdown: '',
      files: [
        {
          data: COLLAGE_BUFFER,
          filename: `collage you have ever posted.png`,
          mimeType: 'image/png',
        },
      ],
    });
  });

  it('posts only once when collage is unavailable', async () => {
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
  });
});
