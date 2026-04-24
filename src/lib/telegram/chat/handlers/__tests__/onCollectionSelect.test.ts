import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/supabase/in_process_artists/selectArtists', () => ({
  default: vi.fn(),
}));

import selectArtists from '@/lib/supabase/in_process_artists/selectArtists';
import { registerOnCollectionSelect } from '../onCollectionSelect';
import { COLLECTION_SELECT_ACTION_ID } from '../../consts';

const ARTIST_ADDRESS = '0xaaa';
const TELEGRAM_USERNAME = 'u1';
const COL_ADDRESS = '0xcollection123';

const makeBot = () => {
  const handler = { fn: (_event: unknown) => Promise.resolve() };
  const bot = {
    onAction: vi.fn((_, fn: (event: unknown) => Promise<void>) => {
      handler.fn = fn;
    }),
  };
  return { bot, handler };
};

const makeEvent = (
  overrides: {
    value?: string;
    userName?: string | null;
    thread?: { post: ReturnType<typeof vi.fn>; channelId: string } | null;
  } = {}
) => {
  const post = vi.fn().mockResolvedValue(undefined);
  return {
    value: COL_ADDRESS,
    user: { userName: TELEGRAM_USERNAME },
    thread: { post, channelId: 'telegram:1' },
    ...overrides,
  };
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(selectArtists).mockResolvedValue({
    data: [{ address: ARTIST_ADDRESS }],
    error: null,
  } as never);
});

describe('registerOnCollectionSelect', () => {
  it('registers under COLLECTION_SELECT_ACTION_ID', () => {
    const { bot } = makeBot();
    registerOnCollectionSelect(bot as never);
    expect(bot.onAction).toHaveBeenCalledWith(
      COLLECTION_SELECT_ACTION_ID,
      expect.any(Function)
    );
  });

  it('posts a confirmation with the collection address', async () => {
    const { bot, handler } = makeBot();
    registerOnCollectionSelect(bot as never);
    const event = makeEvent();
    await handler.fn(event);

    expect(event.thread?.post).toHaveBeenCalledWith(
      `Selected collection: ${COL_ADDRESS}`
    );
  });

  it('exits when thread is null', async () => {
    const { bot, handler } = makeBot();
    registerOnCollectionSelect(bot as never);
    await handler.fn({ ...makeEvent(), thread: null });
    expect(selectArtists).not.toHaveBeenCalled();
  });

  it('exits when value is empty', async () => {
    const { bot, handler } = makeBot();
    registerOnCollectionSelect(bot as never);
    await handler.fn({ ...makeEvent(), value: '' });
    expect(selectArtists).not.toHaveBeenCalled();
  });

  it('exits when artist is not found', async () => {
    vi.mocked(selectArtists).mockResolvedValue({
      data: [],
      error: null,
    } as never);

    const { bot, handler } = makeBot();
    registerOnCollectionSelect(bot as never);
    const event = makeEvent();
    await handler.fn(event);

    expect(event.thread?.post).not.toHaveBeenCalled();
  });
});
