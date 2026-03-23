import { describe, it, expect, vi, beforeEach } from 'vitest';
import uploadPhotoAttachment from '../uploadPhotoAttachment';

vi.mock('@/lib/arweave/uploadToArweave', () => ({ default: vi.fn() }));
vi.mock('@/lib/arweave/uploadJson', () => ({ uploadJson: vi.fn() }));
vi.mock('../getTelegramFilePath', () => ({ default: vi.fn() }));

import uploadToArweave from '@/lib/arweave/uploadToArweave';
import { uploadJson } from '@/lib/arweave/uploadJson';
import getTelegramFilePath from '../getTelegramFilePath';

const BUFFER = Buffer.from('image data');

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(getTelegramFilePath).mockResolvedValue('photos/file.jpg');
  vi.mocked(uploadToArweave).mockResolvedValue('ar://image-hash');
  vi.mocked(uploadJson).mockResolvedValue('ar://metadata-hash');
});

const makeAttachment = (overrides: Record<string, unknown> = {}) => ({
  type: 'image',
  fetchData: vi.fn().mockResolvedValue(BUFFER),
  ...overrides,
});

describe('uploadPhotoAttachment', () => {
  it('throws when attachment has no fetchData', async () => {
    await expect(
      uploadPhotoAttachment({ type: 'image' } as never, 'file-id', 'Photo')
    ).rejects.toThrow('Attachment has no fetchData');
  });

  it('returns uri, mimeType, and mediaUri on success', async () => {
    const result = await uploadPhotoAttachment(
      makeAttachment() as never,
      'file-id',
      'My Photo'
    );

    expect(result).toEqual({
      uri: 'ar://metadata-hash',
      mimeType: 'image/jpeg',
      mediaUri: 'ar://image-hash',
    });
  });

  it('uses attachment.mimeType when provided', async () => {
    const result = await uploadPhotoAttachment(
      makeAttachment({ mimeType: 'image/png' }) as never,
      'file-id',
      'My Photo'
    );

    expect(result.mimeType).toBe('image/png');
  });

  it('falls back to getMimeTypeFromFilePath when attachment has no mimeType', async () => {
    vi.mocked(getTelegramFilePath).mockResolvedValue('photos/file.webp');

    const result = await uploadPhotoAttachment(
      makeAttachment() as never,
      'file-id',
      'My Photo'
    );

    expect(result.mimeType).toBe('image/webp');
  });

  it('uploads image buffer to Arweave with the correct name and mimeType', async () => {
    await uploadPhotoAttachment(
      makeAttachment() as never,
      'file-id',
      'My Photo'
    );

    expect(uploadToArweave).toHaveBeenCalledOnce();
    const [file] = vi.mocked(uploadToArweave).mock.calls[0];
    expect(file.name).toBe('My Photo');
    expect(file.type).toBe('image/jpeg');
  });

  it('uploads JSON metadata with the image URI and content', async () => {
    await uploadPhotoAttachment(
      makeAttachment() as never,
      'file-id',
      'My Photo'
    );

    expect(uploadJson).toHaveBeenCalledWith({
      name: 'My Photo',
      image: 'ar://image-hash',
      content: { mime: 'image/jpeg', uri: 'ar://image-hash' },
    });
  });
});
