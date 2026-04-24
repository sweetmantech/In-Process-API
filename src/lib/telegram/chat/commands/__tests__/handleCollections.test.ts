import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Address } from 'viem';
import { Card, Actions, Button } from 'chat';

vi.mock('@/lib/supabase/in_process_collections/selectCollections', () => ({
  default: vi.fn(),
}));

import selectCollections from '@/lib/supabase/in_process_collections/selectCollections';
import handleCollections from '../handleCollections';
import {
  COLLECTION_SELECT_ACTION_ID,
  COLLECTIONS_LOAD_MORE_ACTION_ID,
} from '../../consts';
import { CHAIN_ID } from '@/lib/consts';

const ARTIST_ADDRESS = '0xartist' as Address;

const makeThread = () => ({
  post: vi.fn().mockResolvedValue(undefined),
  channelId: 'telegram:7',
});

beforeEach(() => {
  vi.clearAllMocks();
});

describe('handleCollections', () => {
  it('posts empty state when the artist has no collections', async () => {
    vi.mocked(selectCollections).mockResolvedValue({
      data: [],
      count: 0,
      error: null,
    });

    const thread = makeThread();
    await handleCollections(thread as never, ARTIST_ADDRESS);

    expect(selectCollections).toHaveBeenCalledWith({
      artists: [ARTIST_ADDRESS],
      limit: 20,
      chainId: CHAIN_ID,
    });
    expect(thread.post).toHaveBeenCalledWith(
      "You don't have any collections yet."
    );
  });

  it('posts a card with one button per collection', async () => {
    vi.mocked(selectCollections).mockResolvedValue({
      data: [
        { address: '0xc1', name: 'First Drop' },
        { address: '0xc2', name: 'Second Drop' },
      ] as never,
      count: 2,
      error: null,
    });

    const thread = makeThread();
    await handleCollections(thread as never, ARTIST_ADDRESS);

    expect(thread.post).toHaveBeenCalledWith(
      Card({
        title: 'Select a collection',
        children: [
          Actions([
            Button({
              id: COLLECTION_SELECT_ACTION_ID,
              label: 'First Drop',
              value: '0xc1',
            }),
          ]),
          Actions([
            Button({
              id: COLLECTION_SELECT_ACTION_ID,
              label: 'Second Drop',
              value: '0xc2',
            }),
          ]),
        ],
      })
    );
  });

  it('adds a Load more button when total exceeds the fetched page', async () => {
    vi.mocked(selectCollections).mockResolvedValue({
      data: [{ address: '0xc1', name: 'First Drop' }] as never,
      count: 50,
      error: null,
    });

    const thread = makeThread();
    await handleCollections(thread as never, ARTIST_ADDRESS);

    expect(thread.post).toHaveBeenCalledWith(
      Card({
        title: 'Select a collection',
        children: [
          Actions([
            Button({
              id: COLLECTION_SELECT_ACTION_ID,
              label: 'First Drop',
              value: '0xc1',
            }),
          ]),
          Actions([
            Button({
              id: COLLECTIONS_LOAD_MORE_ACTION_ID,
              label: 'Load more',
              value: '2',
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

    const thread = makeThread();
    await expect(
      handleCollections(thread as never, ARTIST_ADDRESS)
    ).rejects.toEqual({ message: 'db down' });
  });
});
