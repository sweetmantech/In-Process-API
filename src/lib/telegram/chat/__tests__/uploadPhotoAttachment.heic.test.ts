import { describe, it, expect, vi, beforeEach } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
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

const PHOTO_URL =
  'https://supabase.co/storage/v1/object/public/bucket/photo.jpg';
const META_URL =
  'https://supabase.co/storage/v1/object/public/bucket/meta.json';

const readHeicFixture = (name: string): Buffer =>
  readFileSync(join(__dirname, 'fixtures', name));

const HEIC_DECODE_TIMEOUT_MS = 30_000;

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(getTelegramFilePath).mockResolvedValue('photos/file_1');
  vi.mocked(uploadFileToSupabase).mockResolvedValue(PHOTO_URL);
  vi.mocked(uploadJsonToSupabase).mockResolvedValue(META_URL);
});

describe('uploadPhotoAttachment HEIC integration', () => {
  it(
    'uploads HEIC attachments as JPEG',
    async () => {
      const heicBuffer = readHeicFixture('apple-styled-photo.heic');

      const result = await uploadPhotoAttachment(
        {
          type: 'image',
          mimeType: 'image/heic',
          fetchData: () => Promise.resolve(heicBuffer),
        } as never,
        'file-id',
        'My HEIC Photo'
      );

      expect(result.mimeType).toBe('image/jpeg');
      expect(uploadFileToSupabase).toHaveBeenCalledOnce();

      const [file] = vi.mocked(uploadFileToSupabase).mock.calls[0];
      expect(file.type).toBe('image/jpeg');

      const uploaded = Buffer.from(await file.arrayBuffer());
      expect(uploaded[0]).toBe(0xff);
      expect(uploaded[1]).toBe(0xd8);

      expect(uploadJsonToSupabase).toHaveBeenCalledWith({
        name: 'My HEIC Photo',
        image: PHOTO_URL,
        content: { mime: 'image/jpeg', uri: PHOTO_URL },
      });
    },
    HEIC_DECODE_TIMEOUT_MS
  );
});
