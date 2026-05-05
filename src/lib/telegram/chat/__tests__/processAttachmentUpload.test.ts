import { describe, it, expect, vi, beforeEach } from 'vitest';
import processAttachmentUpload from '../processAttachmentUpload';

vi.mock('../uploadPhotoAttachment', () => ({ default: vi.fn() }));
vi.mock('../uploadVideoAttachment', () => ({ default: vi.fn() }));

import uploadPhotoAttachment from '../uploadPhotoAttachment';
import uploadVideoAttachment from '../uploadVideoAttachment';

const PHOTO_RESULT = {
  uri: 'ar://photo',
  mimeType: 'image/jpeg',
  mediaUri: 'ar://photo',
};
const VIDEO_RESULT = {
  uri: 'ar://video',
  mimeType: 'video/mp4',
  mediaUri: 'https://mux.com/play',
};

const ARTIST = '0xartist';

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(uploadPhotoAttachment).mockResolvedValue(PHOTO_RESULT);
  vi.mocked(uploadVideoAttachment).mockResolvedValue(VIDEO_RESULT);
});

describe('processAttachmentUpload', () => {
  it('calls uploadPhotoAttachment for image type', async () => {
    const attachment = { type: 'image', size: 500 };

    const result = await processAttachmentUpload(
      attachment as never,
      'file-id',
      'My Photo',
      ARTIST
    );

    expect(uploadPhotoAttachment).toHaveBeenCalledWith(
      attachment,
      'file-id',
      'My Photo',
      ARTIST
    );
    expect(uploadVideoAttachment).not.toHaveBeenCalled();
    expect(result).toEqual(PHOTO_RESULT);
  });

  it('calls uploadVideoAttachment for video type', async () => {
    const attachment = { type: 'video', size: 1000 };

    const result = await processAttachmentUpload(
      attachment as never,
      'file-id',
      'My Video',
      ARTIST,
      'thumb-id'
    );

    expect(uploadVideoAttachment).toHaveBeenCalledWith(
      attachment,
      'file-id',
      'My Video',
      ARTIST,
      'thumb-id'
    );
    expect(uploadPhotoAttachment).not.toHaveBeenCalled();
    expect(result).toEqual(VIDEO_RESULT);
  });

  it('passes thumbFileId through to uploadVideoAttachment', async () => {
    const attachment = { type: 'video', size: 1000 };

    await processAttachmentUpload(
      attachment as never,
      'file-id',
      'My Video',
      ARTIST,
      'thumb-123'
    );

    expect(uploadVideoAttachment).toHaveBeenCalledWith(
      attachment,
      'file-id',
      'My Video',
      ARTIST,
      'thumb-123'
    );
  });

  it('calls uploadVideoAttachment for non-image types', async () => {
    const attachment = { type: 'document', size: 200 };

    await processAttachmentUpload(
      attachment as never,
      'file-id',
      'Doc',
      ARTIST
    );

    expect(uploadVideoAttachment).toHaveBeenCalled();
    expect(uploadPhotoAttachment).not.toHaveBeenCalled();
  });
});
