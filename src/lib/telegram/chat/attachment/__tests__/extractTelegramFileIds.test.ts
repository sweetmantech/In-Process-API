import { describe, it, expect } from 'vitest';
import extractTelegramFileIds from '@/lib/telegram/chat/attachment/extractTelegramFileIds';

const attachment = (fileId?: string) =>
  ({ fetchMetadata: fileId ? { fileId } : undefined }) as never;

describe('extractTelegramFileIds', () => {
  describe('photo messages', () => {
    it('extracts fileId from the attachment metadata', () => {
      const message = { raw: {} };
      const { fileId } = extractTelegramFileIds(
        message as never,
        attachment('large_id')
      );
      expect(fileId).toBe('large_id');
    });

    it('returns no thumbFileId for photo messages', () => {
      const message = { raw: {} };
      const { thumbFileId } = extractTelegramFileIds(
        message as never,
        attachment('photo_id')
      );
      expect(thumbFileId).toBeUndefined();
    });
  });

  describe('video messages', () => {
    it('extracts fileId from the attachment metadata', () => {
      const message = { raw: { video: { file_id: 'video_id' } } };
      const { fileId } = extractTelegramFileIds(
        message as never,
        attachment('video_id')
      );
      expect(fileId).toBe('video_id');
    });

    it('extracts thumbFileId when video has a thumb', () => {
      const message = {
        raw: { video: { file_id: 'video_id', thumb: { file_id: 'thumb_id' } } },
      };
      const { fileId, thumbFileId } = extractTelegramFileIds(
        message as never,
        attachment('video_id')
      );
      expect(fileId).toBe('video_id');
      expect(thumbFileId).toBe('thumb_id');
    });

    it('returns undefined thumbFileId when video has no thumb', () => {
      const message = { raw: { video: { file_id: 'video_id' } } };
      const { thumbFileId } = extractTelegramFileIds(
        message as never,
        attachment('video_id')
      );
      expect(thumbFileId).toBeUndefined();
    });
  });

  describe('document messages', () => {
    it('extracts fileId for an image sent as a document', () => {
      const message = { raw: {} };
      const { fileId, thumbFileId } = extractTelegramFileIds(
        message as never,
        attachment('document_id')
      );
      expect(fileId).toBe('document_id');
      expect(thumbFileId).toBeUndefined();
    });
  });

  describe('missing media', () => {
    it('throws when the attachment has no fileId', () => {
      const message = { raw: {} };
      expect(() =>
        extractTelegramFileIds(message as never, attachment(undefined))
      ).toThrow('No Telegram media file_id found');
    });
  });
});
