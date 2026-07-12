import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock(
  '@/lib/telegram/chat/collection/clearSelectedCollectionAddress',
  () => ({
    default: vi.fn().mockResolvedValue(undefined),
  })
);

import clearSelectedCollectionAddress from '@/lib/telegram/chat/collection/clearSelectedCollectionAddress';
import { registerOnCollectionSelectionCancel } from '../onCollectionSelectionCancel';
import { COLLECTION_SELECTION_CANCEL_ACTION_ID } from '@/lib/telegram/chat/consts';

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
    thread?: {
      post: ReturnType<typeof vi.fn>;
      channelId: string;
      _stateAdapter: { set: ReturnType<typeof vi.fn> };
    } | null;
  } = {}
) => {
  const post = vi.fn().mockResolvedValue(undefined);
  const set = vi.fn().mockResolvedValue(undefined);
  return {
    value: '',
    thread: { post, channelId: 'telegram:1', _stateAdapter: { set } },
    ...overrides,
  };
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(clearSelectedCollectionAddress).mockResolvedValue(undefined);
});

describe('registerOnCollectionSelectionCancel', () => {
  it('registers under COLLECTION_SELECTION_CANCEL_ACTION_ID', () => {
    const { bot } = makeBot();
    registerOnCollectionSelectionCancel(bot as never);
    expect(bot.onAction).toHaveBeenCalledWith(
      COLLECTION_SELECTION_CANCEL_ACTION_ID,
      expect.any(Function)
    );
  });

  it('clears stored collection and posts cancellation copy', async () => {
    const { bot, handler } = makeBot();
    registerOnCollectionSelectionCancel(bot as never);
    const event = makeEvent();

    await handler.fn(event);

    expect(clearSelectedCollectionAddress).toHaveBeenCalledWith(event.thread);
    expect(event.thread?.post).toHaveBeenCalledWith(
      'The selected collection has been cancelled.'
    );
  });

  it('exits when thread is null', async () => {
    const { bot, handler } = makeBot();
    registerOnCollectionSelectionCancel(bot as never);

    await handler.fn({ ...makeEvent(), thread: null });

    expect(clearSelectedCollectionAddress).not.toHaveBeenCalled();
  });
});
