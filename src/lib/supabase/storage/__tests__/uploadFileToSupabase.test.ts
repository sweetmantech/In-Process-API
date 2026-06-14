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

  it('uses uuid as path regardless of file name', async () => {
    const file = new File(['data'], 'खुशहाल ज़िंदगी', { type: 'image/jpeg' });
    await uploadFileToSupabase(file);

    const [path] = mockUpload.mock.calls[0];
    expect(path).toBe('test-uuid');
  });

  it('passes file.type as contentType', async () => {
    const file = new File(['data'], 'photo.jpg', { type: 'image/jpeg' });
    await uploadFileToSupabase(file);

    const [, , options] = mockUpload.mock.calls[0];
    expect(options.contentType).toBe('image/jpeg');
  });
});
