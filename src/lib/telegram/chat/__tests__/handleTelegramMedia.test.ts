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

const makeThread = (stateOverride?: Record<string, unknown>) => ({
  post: vi.fn().mockResolvedValue(undefined),
  startTyping: vi.fn().mockResolvedValue(undefined),
  state: Promise.resolve(stateOverride ?? {}),
  setState: vi.fn().mockResolvedValue(undefined),
});

const makeMessage = (raw: Record<string, unknown> = {}) => ({
  raw,
  attachments: [],
  text: '',
});

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(extractTelegramFileIds).mockReturnValue({
    fileId: 'file-123',
    thumbFileId: 'thumb-456',
  });
  vi.mocked(isTooBigForTelegram).mockReturnValue(false);
  vi.mocked(processTelegramMedia).mockResolvedValue(undefined);
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

  describe('single attachment (no media_group_id)', () => {
    it('always posts the in-progress message', async () => {
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

    it('uses an untitled fallback title when text is empty', async () => {
      const thread = makeThread();

      await handleTelegramMedia(
        thread as never,
        makeMessage() as never,
        { type: 'image', size: 500 } as never,
        '',
        ARTIST_ADDRESS
      );

      const [, , , title] = vi.mocked(processTelegramMedia).mock.calls[0];
      expect(title).toMatch(/^untitled-\d+$/);
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

  describe('media group messages (media_group_id present)', () => {
    it('posts the in-progress message and saves group id when first in group', async () => {
      const thread = makeThread({});

      await handleTelegramMedia(
        thread as never,
        makeMessage({ media_group_id: 'grp-1' }) as never,
        { type: 'image', size: 500 } as never,
        'My Title',
        ARTIST_ADDRESS
      );

      expect(thread.post).toHaveBeenCalledWith(
        '⏳ In Process will post your moment. Please wait a few seconds...'
      );
      expect(thread.setState).toHaveBeenCalledWith({
        waitingMessageSentForGroupId: 'grp-1',
      });
    });

    it('skips the in-progress message when already sent for this group', async () => {
      const thread = makeThread({ waitingMessageSentForGroupId: 'grp-1' });

      await handleTelegramMedia(
        thread as never,
        makeMessage({ media_group_id: 'grp-1' }) as never,
        { type: 'image', size: 500 } as never,
        'My Title',
        ARTIST_ADDRESS
      );

      expect(thread.post).not.toHaveBeenCalledWith(
        expect.stringContaining('⏳')
      );
      expect(thread.setState).not.toHaveBeenCalled();
    });

    it('posts the in-progress message for a different group id', async () => {
      const thread = makeThread({ waitingMessageSentForGroupId: 'grp-1' });

      await handleTelegramMedia(
        thread as never,
        makeMessage({ media_group_id: 'grp-2' }) as never,
        { type: 'image', size: 500 } as never,
        'My Title',
        ARTIST_ADDRESS
      );

      expect(thread.post).toHaveBeenCalledWith(
        '⏳ In Process will post your moment. Please wait a few seconds...'
      );
    });

    it('still calls processTelegramMedia even when in-progress message is skipped', async () => {
      const thread = makeThread({ waitingMessageSentForGroupId: 'grp-1' });

      await handleTelegramMedia(
        thread as never,
        makeMessage({ media_group_id: 'grp-1' }) as never,
        { type: 'image', size: 500 } as never,
        'My Title',
        ARTIST_ADDRESS
      );

      expect(processTelegramMedia).toHaveBeenCalledOnce();
    });
  });
});
