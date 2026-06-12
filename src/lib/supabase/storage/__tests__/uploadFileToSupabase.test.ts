import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockUpload = vi.fn();
const mockGetPublicUrl = vi.fn();

vi.mock('@/lib/supabase/client', () => ({
  supabase: {
    storage: {
      from: vi.fn(() => ({
        upload: mockUpload,
        getPublicUrl: mockGetPublicUrl,
      })),
    },
  },
}));

vi.mock('@/lib/consts', () => ({
  SUPABASE_STORAGE_BUCKET: 'in_process_files',
}));

vi.mock('uuid', () => ({ v4: () => 'test-uuid' }));

import uploadFileToSupabase from '../uploadFileToSupabase';

const PUBLIC_URL =
  'https://example.supabase.co/storage/v1/object/public/in_process_files/test-uuid';

beforeEach(() => {
  vi.clearAllMocks();
  mockUpload.mockResolvedValue({ error: null });
  mockGetPublicUrl.mockReturnValue({ data: { publicUrl: PUBLIC_URL } });
});

describe('uploadFileToSupabase', () => {
  it('uploads and returns a public URL', async () => {
    const file = new File(['data'], 'photo.jpg', { type: 'image/jpeg' });
    const result = await uploadFileToSupabase(file);
    expect(result).toBe(PUBLIC_URL);
  });

  it('throws when supabase returns an error', async () => {
    mockUpload.mockResolvedValue({ error: { message: 'Upload failed' } });
    const file = new File(['data'], 'photo.jpg', { type: 'image/jpeg' });
    await expect(uploadFileToSupabase(file)).rejects.toThrow(
      'Supabase upload failed: Upload failed'
    );
  });

  it('normalizes empty file name to "upload" before uploading', async () => {
    const file = new File(['data'], '', { type: 'image/jpeg' });
    await uploadFileToSupabase(file);

    const [, uploadedFile] = mockUpload.mock.calls[0];
    expect(uploadedFile.name).toBe('upload');
    expect(uploadedFile.type).toBe('image/jpeg');
  });

  it('preserves non-empty file names', async () => {
    const file = new File(['data'], 'my-photo.jpg', { type: 'image/jpeg' });
    await uploadFileToSupabase(file);

    const [, uploadedFile] = mockUpload.mock.calls[0];
    expect(uploadedFile.name).toBe('my-photo.jpg');
  });
});
