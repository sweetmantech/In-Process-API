import { describe, it, expect } from 'vitest';
import extractTelegramFileIds from '../extractTelegramFileIds';

describe('extractTelegramFileIds', () => {
  describe('photo messages', () => {
    it('extracts fileId from the last (largest) photo in the array', () => {
      const message = {
        raw: {
          photo: [
            { file_id: 'small_id' },
            { file_id: 'medium_id' },
            { file_id: 'large_id' },
          ],
        },
      };
      const { fileId } = extractTelegramFileIds(message as never);
      expect(fileId).toBe('large_id');
    });

    it('returns no thumbFileId for photo messages', () => {
      const message = { raw: { photo: [{ file_id: 'photo_id' }] } };
      const { thumbFileId } = extractTelegramFileIds(message as never);
      expect(thumbFileId).toBeUndefined();
    });

    it('throws when photo array is empty', () => {
      const message = { raw: { photo: [] } };
      expect(() => extractTelegramFileIds(message as never)).toThrow(
        'No Telegram media file_id found'
      );
    });
  });

  describe('video messages', () => {
    it('extracts fileId from video', () => {
      const message = { raw: { video: { file_id: 'video_id' } } };
      const { fileId } = extractTelegramFileIds(message as never);
      expect(fileId).toBe('video_id');
    });

    it('extracts thumbFileId when video has a thumb', () => {
      const message = {
        raw: { video: { file_id: 'video_id', thumb: { file_id: 'thumb_id' } } },
      };
      const { fileId, thumbFileId } = extractTelegramFileIds(message as never);
      expect(fileId).toBe('video_id');
      expect(thumbFileId).toBe('thumb_id');
    });

    it('returns undefined thumbFileId when video has no thumb', () => {
      const message = { raw: { video: { file_id: 'video_id' } } };
      const { thumbFileId } = extractTelegramFileIds(message as never);
      expect(thumbFileId).toBeUndefined();
    });
  });

  describe('missing media', () => {
    it('throws when neither photo nor video is present', () => {
      const message = { raw: {} };
      expect(() => extractTelegramFileIds(message as never)).toThrow(
        'No Telegram media file_id found'
      );
    });
  });
});
