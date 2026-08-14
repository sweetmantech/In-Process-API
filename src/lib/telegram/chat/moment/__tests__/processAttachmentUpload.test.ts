import { describe, it, expect, vi, beforeEach } from 'vitest';
import processAttachmentUpload from '@/lib/telegram/chat/moment/processAttachmentUpload';

vi.mock('../uploadPhotoAttachment', () => ({ default: vi.fn() }));
vi.mock('../uploadVideoAttachment', () => ({ default: vi.fn() }));

import uploadPhotoAttachment from '@/lib/telegram/chat/moment/uploadPhotoAttachment';
import uploadVideoAttachment from '@/lib/telegram/chat/moment/uploadVideoAttachment';

const PHOTO_RESULT = {
  uri: 'https://supabase.co/photo',
  mimeType: 'image/jpeg',
  mediaUri: 'https://supabase.co/photo',
};
const VIDEO_RESULT = {
  uri: 'https://supabase.co/meta',
  mimeType: 'video/mp4',
  mediaUri: 'https://mux.com/play',
};

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
      'My Photo'
    );

    expect(uploadPhotoAttachment).toHaveBeenCalledWith(
      attachment,
      'file-id',
      'My Photo'
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
      'thumb-id'
    );

    expect(uploadVideoAttachment).toHaveBeenCalledWith(
      attachment,
      'file-id',
      'My Video',
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
      'thumb-123'
    );

    expect(uploadVideoAttachment).toHaveBeenCalledWith(
      attachment,
      'file-id',
      'My Video',
      'thumb-123'
    );
  });

  it('rejects unsupported attachment types', async () => {
    await expect(
      processAttachmentUpload(
        { type: 'file', size: 200 } as never,
        'file-id',
        'Doc'
      )
    ).rejects.toThrow('Unsupported attachment type: file');
  });
});
