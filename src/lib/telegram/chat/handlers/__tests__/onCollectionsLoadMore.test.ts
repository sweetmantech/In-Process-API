import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Card, Actions, Button } from 'chat';

vi.mock('@/lib/supabase/in_process_artists/selectArtists', () => ({
  default: vi.fn(),
}));
vi.mock('@/lib/supabase/in_process_collections/selectCollections', () => ({
  default: vi.fn(),
}));

import selectArtists from '@/lib/supabase/in_process_artists/selectArtists';
import selectCollections from '@/lib/supabase/in_process_collections/selectCollections';
import { registerOnCollectionsLoadMore } from '../onCollectionsLoadMore';
import {
  COLLECTION_SELECT_ACTION_ID,
  COLLECTIONS_LOAD_MORE_ACTION_ID,
} from '../../consts';
import { CHAIN_ID } from '@/lib/consts';

const ARTIST_ADDRESS = '0xaaa';
const TELEGRAM_USERNAME = 'u1';

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
    value: '2',
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
  vi.mocked(selectCollections).mockResolvedValue({
    data: [],
    count: 0,
    error: null,
  } as never);
});

describe('registerOnCollectionsLoadMore', () => {
  it('registers under COLLECTIONS_LOAD_MORE_ACTION_ID', () => {
    const { bot } = makeBot();
    registerOnCollectionsLoadMore(bot as never);
    expect(bot.onAction).toHaveBeenCalledWith(
      COLLECTIONS_LOAD_MORE_ACTION_ID,
      expect.any(Function)
    );
  });

  it('exits when thread is null', async () => {
    const { bot, handler } = makeBot();
    registerOnCollectionsLoadMore(bot as never);
    await handler.fn({ ...makeEvent(), thread: null });
    expect(selectCollections).not.toHaveBeenCalled();
  });

  it('exits when value is empty', async () => {
    const { bot, handler } = makeBot();
    registerOnCollectionsLoadMore(bot as never);
    await handler.fn({ ...makeEvent(), value: '' });
    expect(selectCollections).not.toHaveBeenCalled();
  });

  it('posts an empty card when the page has no collections', async () => {
    const { bot, handler } = makeBot();
    registerOnCollectionsLoadMore(bot as never);
    const event = makeEvent();
    await handler.fn(event);
    expect(event.thread?.post).toHaveBeenCalledWith(Card({ children: [] }));
  });

  it('posts a card with collection buttons for the requested page', async () => {
    vi.mocked(selectCollections).mockResolvedValue({
      data: [{ address: '0xc3', name: 'Third Drop' }] as never,
      count: 21,
      error: null,
    });

    const { bot, handler } = makeBot();
    registerOnCollectionsLoadMore(bot as never);
    const event = makeEvent({ value: '2' });
    await handler.fn(event);

    expect(selectCollections).toHaveBeenCalledWith({
      artists: [ARTIST_ADDRESS],
      limit: 20,
      chainId: CHAIN_ID,
      page: 2,
    });
    expect(event.thread?.post).toHaveBeenCalledWith(
      Card({
        children: [
          Actions([
            Button({
              id: COLLECTION_SELECT_ACTION_ID,
              label: 'Third Drop',
              value: '0xc3',
            }),
          ]),
        ],
      })
    );
  });

  it('appends another Load more button when more pages remain', async () => {
    vi.mocked(selectCollections).mockResolvedValue({
      data: [{ address: '0xc3', name: 'Third Drop' }] as never,
      count: 100,
      error: null,
    });

    const { bot, handler } = makeBot();
    registerOnCollectionsLoadMore(bot as never);
    const event = makeEvent({ value: '2' });
    await handler.fn(event);

    expect(event.thread?.post).toHaveBeenCalledWith(
      Card({
        children: [
          Actions([
            Button({
              id: COLLECTION_SELECT_ACTION_ID,
              label: 'Third Drop',
              value: '0xc3',
            }),
          ]),
          Actions([
            Button({
              id: COLLECTIONS_LOAD_MORE_ACTION_ID,
              label: 'Load more',
              value: '3',
            }),
          ]),
        ],
      })
    );
  });

  it('rethrows on select error', async () => {
    vi.mocked(selectCollections).mockResolvedValue({
      data: null,
      count: null,
      error: { message: 'db down' } as never,
    });

    const { bot, handler } = makeBot();
    registerOnCollectionsLoadMore(bot as never);
    await expect(handler.fn(makeEvent())).rejects.toEqual({
      message: 'db down',
    });
  });
});
