import { describe, it, expect, vi, beforeEach } from 'vitest';
import uploadPhotoAttachment from '../uploadPhotoAttachment';

vi.mock('@/lib/supabase/storage/uploadFileToSupabase', () => ({
  default: vi.fn(),
}));
vi.mock('@/lib/supabase/storage/uploadJsonToSupabase', () => ({
  default: vi.fn(),
}));
vi.mock('../getTelegramFilePath', () => ({ default: vi.fn() }));

import uploadFileToSupabase from '@/lib/supabase/storage/uploadFileToSupabase';
import uploadJsonToSupabase from '@/lib/supabase/storage/uploadJsonToSupabase';
import getTelegramFilePath from '../getTelegramFilePath';

const BUFFER = Buffer.from('image data');
const PHOTO_URL =
  'https://supabase.co/storage/v1/object/public/bucket/photo.jpg';
const META_URL =
  'https://supabase.co/storage/v1/object/public/bucket/meta.json';

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(getTelegramFilePath).mockResolvedValue('photos/file.jpg');
  vi.mocked(uploadFileToSupabase).mockResolvedValue(PHOTO_URL);
  vi.mocked(uploadJsonToSupabase).mockResolvedValue(META_URL);
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
      uri: META_URL,
      mimeType: 'image/jpeg',
      mediaUri: PHOTO_URL,
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

  it('uploads image file to Supabase with correct name and mimeType', async () => {
    await uploadPhotoAttachment(
      makeAttachment() as never,
      'file-id',
      'My Photo'
    );

    expect(uploadFileToSupabase).toHaveBeenCalledOnce();
    const [file] = vi.mocked(uploadFileToSupabase).mock.calls[0];
    expect(file.name).toBe('My Photo');
    expect(file.type).toBe('image/jpeg');
  });

  it('uploads image file when name is empty (no caption)', async () => {
    await uploadPhotoAttachment(makeAttachment() as never, 'file-id', '');

    expect(uploadFileToSupabase).toHaveBeenCalledOnce();
    const [file] = vi.mocked(uploadFileToSupabase).mock.calls[0];
    expect(file.name).toBe('');
    expect(file.type).toBe('image/jpeg');
  });

  it('uploads JSON metadata to Supabase with the image URI and content', async () => {
    await uploadPhotoAttachment(
      makeAttachment() as never,
      'file-id',
      'My Photo'
    );

    expect(uploadJsonToSupabase).toHaveBeenCalledWith({
      name: 'My Photo',
      image: PHOTO_URL,
      content: { mime: 'image/jpeg', uri: PHOTO_URL },
    });
  });

  it('preserves empty name in JSON metadata when no caption', async () => {
    await uploadPhotoAttachment(makeAttachment() as never, 'file-id', '');

    expect(uploadJsonToSupabase).toHaveBeenCalledWith({
      name: '',
      image: PHOTO_URL,
      content: { mime: 'image/jpeg', uri: PHOTO_URL },
    });
  });
});
