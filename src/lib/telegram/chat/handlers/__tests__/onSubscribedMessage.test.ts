import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Address } from 'viem';
import { registerOnSubscribedMessage } from '../onSubscribedMessage';

vi.mock('../../processTelegramMedia', () => ({ default: vi.fn() }));
vi.mock('../../handleTelegramMedia', () => ({ default: vi.fn() }));
vi.mock('../../fetchTelegramFile', () => ({ default: vi.fn() }));

import processTelegramMedia from '../../processTelegramMedia';
import handleTelegramMedia from '../../handleTelegramMedia';

const ARTIST_ADDRESS = '0x1234567890abcdef1234567890abcdef12345678' as Address;

const makePending = (overrides: Record<string, unknown> = {}) => ({
  fileId: 'file-123',
  thumbFileId: 'thumb-456',
  attachmentType: 'image' as const,
  attachmentSize: 1024,
  artistAddress: ARTIST_ADDRESS,
  ...overrides,
});

const makeThread = (pending: ReturnType<typeof makePending> | null) => ({
  state: Promise.resolve({ pendingMedia: pending }),
  setState: vi.fn().mockResolvedValue(undefined),
  unsubscribe: vi.fn().mockResolvedValue(undefined),
  post: vi.fn().mockResolvedValue(undefined),
  startTyping: vi.fn().mockResolvedValue(undefined),
});

const makeMessage = (
  overrides: { text?: string; attachments?: unknown[] } = {}
) => ({
  text: overrides.text ?? '',
  attachments: overrides.attachments ?? [],
});

const setup = () => {
  let capturedHandler:
    | ((thread: unknown, message: unknown) => Promise<void>)
    | null = null;
  const bot = {
    onSubscribedMessage: vi.fn((handler) => {
      capturedHandler = handler;
    }),
  };
  registerOnSubscribedMessage(bot as never);
  const invoke = (thread: unknown, message: unknown) => {
    if (!capturedHandler) throw new Error('handler not registered');
    return capturedHandler(thread, message);
  };
  return { bot, invoke };
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('registerOnSubscribedMessage', () => {
  it('registers a handler with bot.onSubscribedMessage', () => {
    const { bot } = setup();
    expect(bot.onSubscribedMessage).toHaveBeenCalledOnce();
  });

  describe('when there is no pending media', () => {
    it('returns early without posting or changing state', async () => {
      const { invoke } = setup();
      const thread = makeThread(null);
      await invoke(thread, makeMessage({ text: 'some title' }));

      expect(thread.post).not.toHaveBeenCalled();
      expect(thread.setState).not.toHaveBeenCalled();
      expect(thread.unsubscribe).not.toHaveBeenCalled();
    });
  });

  describe('when a new image is sent instead of a title', () => {
    it('clears pending, unsubscribes, then delegates to handleTelegramMedia', async () => {
      const { invoke } = setup();
      const thread = makeThread(makePending());
      const attachment = { type: 'image', size: 500 };
      const message = makeMessage({ text: '', attachments: [attachment] });

      await invoke(thread, message);

      expect(thread.setState).toHaveBeenCalledWith({ pendingMedia: null });
      expect(thread.unsubscribe).toHaveBeenCalledOnce();
      expect(handleTelegramMedia).toHaveBeenCalledWith(
        thread,
        message,
        attachment,
        '',
        ARTIST_ADDRESS
      );
    });

    it('does not call processTelegramMedia', async () => {
      const { invoke } = setup();
      const thread = makeThread(makePending());
      const message = makeMessage({
        attachments: [{ type: 'image', size: 500 }],
      });

      await invoke(thread, message);

      expect(processTelegramMedia).not.toHaveBeenCalled();
    });
  });

  describe('when a new video is sent instead of a title', () => {
    it('delegates to handleTelegramMedia with the video attachment', async () => {
      const { invoke } = setup();
      const thread = makeThread(makePending({ attachmentType: 'video' }));
      const attachment = { type: 'video', size: 2000 };
      const message = makeMessage({ attachments: [attachment] });

      await invoke(thread, message);

      expect(handleTelegramMedia).toHaveBeenCalledWith(
        thread,
        message,
        attachment,
        '',
        ARTIST_ADDRESS
      );
    });
  });

  describe('when no text and no media attachment', () => {
    it('posts the title prompt and does not clear pending state', async () => {
      const { invoke } = setup();
      const thread = makeThread(makePending());

      await invoke(thread, makeMessage({ text: '' }));

      expect(thread.post).toHaveBeenCalledWith(
        '📝 Please send the title as text (not a photo or video).'
      );
      expect(thread.setState).not.toHaveBeenCalled();
      expect(thread.unsubscribe).not.toHaveBeenCalled();
      expect(processTelegramMedia).not.toHaveBeenCalled();
    });
  });

  describe('when a title text is received with pending media', () => {
    it('posts the in-progress message before processing', async () => {
      const { invoke } = setup();
      const thread = makeThread(makePending());

      await invoke(thread, makeMessage({ text: 'My Moment' }));

      expect(thread.post).toHaveBeenCalledWith(
        '⏳ In Process will post your moment. Please wait a few seconds...'
      );
    });

    it('calls processTelegramMedia with the pending media details and title', async () => {
      const { invoke } = setup();
      const pending = makePending();
      const thread = makeThread(pending);

      await invoke(thread, makeMessage({ text: 'My Moment' }));

      expect(processTelegramMedia).toHaveBeenCalledOnce();
      const [, attachment, fileId, text, artistAddress, thumbFileId] =
        vi.mocked(processTelegramMedia).mock.calls[0];
      expect(attachment.type).toBe('image');
      expect(fileId).toBe(pending.fileId);
      expect(text).toBe('My Moment');
      expect(artistAddress).toBe(ARTIST_ADDRESS);
      expect(thumbFileId).toBe(pending.thumbFileId);
    });

    it('clears pendingMedia and unsubscribes only after successful processing', async () => {
      const { invoke } = setup();
      const thread = makeThread(makePending());
      const callOrder: string[] = [];

      vi.mocked(processTelegramMedia).mockImplementationOnce(async () => {
        callOrder.push('processTelegramMedia');
      });
      thread.setState.mockImplementationOnce(async () => {
        callOrder.push('setState');
      });
      thread.unsubscribe.mockImplementationOnce(async () => {
        callOrder.push('unsubscribe');
      });

      await invoke(thread, makeMessage({ text: 'My Moment' }));

      expect(callOrder).toEqual([
        'processTelegramMedia',
        'setState',
        'unsubscribe',
      ]);
      expect(thread.setState).toHaveBeenCalledWith({ pendingMedia: null });
    });

    it('does NOT clear pendingMedia when processTelegramMedia throws', async () => {
      const { invoke } = setup();
      const thread = makeThread(makePending());

      vi.mocked(processTelegramMedia).mockRejectedValueOnce(
        new Error('upload failed')
      );

      await invoke(thread, makeMessage({ text: 'My Moment' }));

      expect(thread.setState).not.toHaveBeenCalled();
      expect(thread.unsubscribe).not.toHaveBeenCalled();
    });

    it('posts a generic error message when processTelegramMedia throws', async () => {
      const { invoke } = setup();
      const thread = makeThread(makePending());

      vi.mocked(processTelegramMedia).mockRejectedValueOnce(
        new Error('upload failed')
      );

      await invoke(thread, makeMessage({ text: 'My Moment' }));

      expect(thread.post).toHaveBeenLastCalledWith(
        '❌ An unexpected error occurred. Please try again later.'
      );
    });

    it('does not expose the raw error message to the user', async () => {
      const { invoke } = setup();
      const thread = makeThread(makePending());

      vi.mocked(processTelegramMedia).mockRejectedValueOnce(
        new Error('secret internal error')
      );

      await invoke(thread, makeMessage({ text: 'My Moment' }));

      const calls = thread.post.mock.calls.flat() as string[];
      expect(calls.some((msg) => msg.includes('secret internal error'))).toBe(
        false
      );
    });
  });
});
