import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Address } from 'viem';
import handleTelegramMedia from '../handleTelegramMedia';

vi.mock('../processTelegramMedia', () => ({ default: vi.fn() }));
vi.mock('../extractTelegramFileIds', () => ({ default: vi.fn() }));
vi.mock('../isTooBigForTelegram', () => ({
  default: vi.fn(),
  TOO_BIG_MESSAGE: '⚠️ Too big',
}));

import processTelegramMedia from '../processTelegramMedia';
import extractTelegramFileIds from '../extractTelegramFileIds';
import isTooBigForTelegram from '../isTooBigForTelegram';

const ARTIST_ADDRESS = '0xabc' as Address;

const makeThread = () => ({
  post: vi.fn().mockResolvedValue(undefined),
  startTyping: vi.fn().mockResolvedValue(undefined),
});

const makeMessage = () => ({ raw: {}, attachments: [], text: '' });

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(extractTelegramFileIds).mockReturnValue({
    fileId: 'file-123',
    thumbFileId: 'thumb-456',
  });
  vi.mocked(isTooBigForTelegram).mockReturnValue(false);
});

describe('handleTelegramMedia', () => {
  describe('when attachment is too big', () => {
    it('posts the TOO_BIG_MESSAGE and returns early', async () => {
      vi.mocked(isTooBigForTelegram).mockReturnValue(true);
      const thread = makeThread();

      await handleTelegramMedia(
        thread as never,
        makeMessage() as never,
        { type: 'image', size: 999 } as never,
        '',
        ARTIST_ADDRESS
      );

      expect(thread.post).toHaveBeenCalledWith('⚠️ Too big');
      expect(processTelegramMedia).not.toHaveBeenCalled();
    });
  });

  describe('when text is empty (no caption)', () => {
    it('uses an untitled fallback title and calls processTelegramMedia', async () => {
      const thread = makeThread();
      const attachment = { type: 'image', size: 500 };

      await handleTelegramMedia(
        thread as never,
        makeMessage() as never,
        attachment as never,
        '',
        ARTIST_ADDRESS
      );

      expect(processTelegramMedia).toHaveBeenCalledOnce();
      const [, , , title] = vi.mocked(processTelegramMedia).mock.calls[0];
      expect(title).toMatch(/^untitled-\d+$/);
    });

    it('posts the in-progress message', async () => {
      const thread = makeThread();

      await handleTelegramMedia(
        thread as never,
        makeMessage() as never,
        { type: 'image', size: 500 } as never,
        '',
        ARTIST_ADDRESS
      );

      expect(thread.post).toHaveBeenCalledWith(
        '⏳ In Process will post your moment. Please wait a few seconds...'
      );
    });
  });

  describe('when text is provided (caption included)', () => {
    it('posts the in-progress message', async () => {
      const thread = makeThread();

      await handleTelegramMedia(
        thread as never,
        makeMessage() as never,
        { type: 'image', size: 500 } as never,
        'My Title',
        ARTIST_ADDRESS
      );

      expect(thread.post).toHaveBeenCalledWith(
        '⏳ In Process will post your moment. Please wait a few seconds...'
      );
    });

    it('calls processTelegramMedia with the correct arguments', async () => {
      const thread = makeThread();
      const attachment = { type: 'image', size: 500 };

      await handleTelegramMedia(
        thread as never,
        makeMessage() as never,
        attachment as never,
        'My Title',
        ARTIST_ADDRESS
      );

      expect(processTelegramMedia).toHaveBeenCalledWith(
        thread,
        attachment,
        'file-123',
        'My Title',
        ARTIST_ADDRESS,
        'thumb-456'
      );
    });
  });
});
