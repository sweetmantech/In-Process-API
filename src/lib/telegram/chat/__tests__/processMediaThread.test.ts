import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Address } from 'viem';
import processMediaThread from '../processMediaThread';

vi.mock('../processSingleMedia', () => ({ default: vi.fn() }));
vi.mock('../processGroupMedia', () => ({ default: vi.fn() }));
vi.mock('../extractTelegramFileIds', () => ({ default: vi.fn() }));
vi.mock('../isTooBigForTelegram', () => ({
  default: vi.fn(),
  TOO_BIG_MESSAGE: '⚠️ Too big',
}));

import processSingleMedia from '../processSingleMedia';
import processGroupMedia from '../processGroupMedia';
import extractTelegramFileIds from '../extractTelegramFileIds';
import isTooBigForTelegram from '../isTooBigForTelegram';

const ARTIST_ADDRESS = '0xabc' as Address;

const makeThread = () => ({
  post: vi.fn().mockResolvedValue(undefined),
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
  vi.mocked(processSingleMedia).mockResolvedValue(undefined);
  vi.mocked(processGroupMedia).mockResolvedValue(undefined);
});

describe('processMediaThread', () => {
  describe('when attachment is too big', () => {
    it('posts the TOO_BIG_MESSAGE and returns early', async () => {
      vi.mocked(isTooBigForTelegram).mockReturnValue(true);
      const thread = makeThread();

      await processMediaThread(
        thread as never,
        makeMessage() as never,
        { type: 'image', size: 999 } as never,
        '',
        ARTIST_ADDRESS
      );

      expect(thread.post).toHaveBeenCalledWith('⚠️ Too big');
      expect(processSingleMedia).not.toHaveBeenCalled();
      expect(processGroupMedia).not.toHaveBeenCalled();
    });
  });

  describe('single attachment (no media_group_id)', () => {
    it('calls processSingleMedia with the correct arguments', async () => {
      const thread = makeThread();
      const attachment = { type: 'image', size: 500 };

      await processMediaThread(
        thread as never,
        makeMessage() as never,
        attachment as never,
        'My Title',
        ARTIST_ADDRESS
      );

      expect(processSingleMedia).toHaveBeenCalledWith(
        thread,
        attachment,
        'file-123',
        'My Title',
        ARTIST_ADDRESS,
        'thumb-456'
      );
    });

    it('passes an empty title when text is empty', async () => {
      const thread = makeThread();

      await processMediaThread(
        thread as never,
        makeMessage() as never,
        { type: 'image', size: 500 } as never,
        '',
        ARTIST_ADDRESS
      );

      const [, , , title] = vi.mocked(processSingleMedia).mock.calls[0];
      expect(title).toBe('');
    });
  });

  describe('media group messages (media_group_id present)', () => {
    it('calls processGroupMedia with the correct arguments', async () => {
      const thread = makeThread();
      const attachment = { type: 'image', size: 500 };
      const date = Math.floor(Date.now() / 1000) - 10;

      await processMediaThread(
        thread as never,
        makeMessage({ media_group_id: 'grp-1', date }) as never,
        attachment as never,
        'My Title',
        ARTIST_ADDRESS
      );

      expect(processGroupMedia).toHaveBeenCalledWith(
        thread,
        attachment,
        'file-123',
        'My Title',
        ARTIST_ADDRESS,
        'grp-1',
        date,
        'thumb-456'
      );
    });

    it('does not call processSingleMedia for media group messages', async () => {
      await processMediaThread(
        makeThread() as never,
        makeMessage({ media_group_id: 'grp-1' }) as never,
        { type: 'image', size: 500 } as never,
        'My Title',
        ARTIST_ADDRESS
      );

      expect(processSingleMedia).not.toHaveBeenCalled();
    });
  });
});
